import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, postTable, userLikesPostTable } from "@/drizzle/schema"

export const byId = publicProcedure
  .input(
    z.object({
      postId: z.string(),
    }),
  )
  .query(async (opts) => {
    const postId = opts.input.postId
    const currentUserId = opts.ctx.currentUserId

    try {
      const post = await db.query.postTable.findFirst({
        where: {
          id: postId,
        },
        with: {
          owner: {
            columns: { id: true, name: true, email: true },
          },
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

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "没有找到对应的动态",
        })
      }

      return post
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取动态失败",
      })
    }
  })
