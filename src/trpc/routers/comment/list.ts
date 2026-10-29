import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userLikesCommentTable } from "@/drizzle/schema"

export const list = publicProcedure
  .input(
    z.object({
      limit: z.number().nullish(),
      cursor: z.date().nullish(),
      postId: z.string(),
      parentId: z.string().nullish(),
    }),
  )
  .query(async (opts) => {
    const limit = opts.input.limit ?? 5
    const cursor = opts.input.cursor
    const postId = opts.input.postId
    const parentId = opts.input.parentId

    const currentUserId = opts.ctx.currentUserId

    const comments = await db.query.commentTable.findMany({
      where: {
        createdAt: { lt: cursor || new Date() },
        postId,
        parentId: parentId ? parentId : { isNull: true },
      },
      orderBy: { createdAt: "desc" },
      limit: limit + 1,
      with: {
        owner: { columns: { id: true, name: true, email: true } },
      },
      extras: {
        isLiked: (table, { sql }) => {
          if (!currentUserId) return sql<boolean>`false`
          return sql<boolean>`
            EXISTS (
              SELECT 1
              FROM ${userLikesCommentTable}
              WHERE ${userLikesCommentTable.userId} = ${currentUserId}
                AND ${userLikesCommentTable.commentId} = ${table.id}
            )
          `
        },
      },
    })

    const commentsToReturn = comments.slice(0, limit)
    const nextCursor = !!comments[limit]
      ? comments[comments.length - 2]?.createdAt
      : null

    return {
      comments: commentsToReturn,
      nextCursor,
    }
  })
