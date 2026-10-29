import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userFollowsUserTable } from "@/drizzle/schema"

export const list = publicProcedure
  .input(
    z.object({
      limit: z.number().nullish(),
      cursor: z.date().nullish(),
    }),
  )
  .query(async (opts) => {
    const { input } = opts
    const limit = input.limit ?? 5
    const { cursor } = input

    const currentUserId = opts.ctx.currentUserId

    try {
      const rows = await db.query.userTable.findMany({
        columns: {
          id: true,
          email: true,
          name: true,
          about: true,
          createdAt: true,
          followersCount: true,
          followeesCount: true,
          postsCount: true,
        },
        where: {
          createdAt: { lt: cursor || new Date() },
        },
        orderBy: { createdAt: "desc" },
        limit: limit + 1,
        extras: {
          isFollowed: (table, { sql }) => {
            if (!currentUserId) return sql<boolean>`false`
            return sql<boolean>`
              EXISTS (
                SELECT 1
                FROM ${userFollowsUserTable}
                WHERE ${userFollowsUserTable.followerId} = ${currentUserId}
                  AND ${userFollowsUserTable.followeeId} = ${table.id}
              )
            `
          },
        },
      })

      const returnedRows = rows.slice(0, limit)
      const nextCursor = !!rows[limit] ? rows[rows.length - 2]?.createdAt : null

      return {
        users: returnedRows,
        nextCursor,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取用户列表失败",
      })
    }
  })
