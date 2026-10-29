import { and, eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, userFollowsUserTable } from "@/drizzle/schema"

export const unfollow = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async (opts) => {
    console.log("follow")
    console.log("opts.ctx.userId", opts.ctx.userId)
    console.log("opts.input.userId", opts.input.userId)

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(userTable)
          .set({ followersCount: sql`${userTable.followersCount} - 1` })
          .where(eq(userTable.id, opts.ctx.userId))
        await tx
          .update(userTable)
          .set({ followeesCount: sql`${userTable.followeesCount} - 1` })
          .where(eq(userTable.id, opts.input.userId))
        await tx
          .delete(userFollowsUserTable)
          .where(
            and(
              eq(userFollowsUserTable.followerId, opts.ctx.userId),
              eq(userFollowsUserTable.followeeId, opts.input.userId),
            ),
          )
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "关注失败",
      })
    }
  })
