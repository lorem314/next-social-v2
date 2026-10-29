import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, postTable, userLikesPostTable } from "@/drizzle/schema"

export const list = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      limit: z.number().nullish(),
      cursor: z.date().nullish(),
    }),
  )
  .query(async (opts) => {
    const { input } = opts
    const limit = input.limit ?? 5
    const { cursor, userId } = input

    const currentUserId = opts.ctx.currentUserId

    try {
      const posts = await db.query.postTable.findMany({
        where: {
          createdAt: { lt: cursor || new Date() },
          ownerId: userId ? { eq: userId } : undefined,
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
                FROM ${userLikesPostTable}
                WHERE ${userLikesPostTable.userId} = ${currentUserId}
                  AND ${userLikesPostTable.postId} = ${table.id}
              )
            `
          },
        },
      })

      const returnedPosts = posts.slice(0, limit)
      const nextCursor = !!posts[limit]
        ? posts[posts.length - 2]?.createdAt
        : null

      return {
        posts: returnedPosts,
        nextCursor,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取动态列表失败",
      })
    }
  })
