import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, userFollowsUserTable } from "@/drizzle/schema"

export const byId = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async (opts) => {
    const userId = opts.input.userId
    const currentUserId = opts.ctx.currentUserId

    let user = undefined
    try {
      const result = await db.query.userTable.findFirst({
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
          id: userId,
        },
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

      user = result

      // ;[user] = await db
      //   .select({
      //     id: userTable.id,
      //     email: userTable.email,
      //     name: userTable.name,
      //     about: userTable.about,
      //     createdAt: userTable.createdAt,
      //     followersCount: userTable.followersCount,
      //     followeesCount: userTable.followeesCount,
      //     postsCount: userTable.postsCount,
      //   })
      //   .from(userTable)
      //   .where(eq(userTable.id, userId))
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取用户数据失败",
      })
    }

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" })
    }

    return user
  })
