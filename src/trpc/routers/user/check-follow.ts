import { and, eq, exists, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, userFollowsUserTable } from "@/drizzle/schema"

export const checkFollow = publicProcedure
  .input(
    z.object({
      followerId: z.string().nullable(),
      followeeId: z.string(),
    }),
  )
  .query(async (opts) => {
    const followerId = opts.input.followerId
    const followeeId = opts.input.followeeId

    const currentUserId = opts.ctx.currentUserId

    if (!currentUserId) {
      return false
    }

    if (!followerId) {
      return false
    }

    try {
      const result = await db.execute(
        sql`
          SELECT EXISTS (
            SELECT 1
            FROM ${userFollowsUserTable}
            WHERE follower_id = ${followerId}
              AND followee_id = ${followeeId}
          ) AS exists
        `,
      )

      // console.log("check follow", result)

      return result.rows[0].exists as boolean
    } catch (error) {
      console.log("error", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "查询关注状态失败",
      })
    }
  })
