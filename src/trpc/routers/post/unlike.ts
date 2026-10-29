import { eq, sql, and } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import {
  userTable,
  postTable,
  userLikesPostTable,
  userLikesTable,
} from "@/drizzle/schema"

export const unlike = protectedProcedure
  .input(
    z.object({
      postId: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const userId = opts.ctx.userId
    const postId = opts.input.postId

    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(userLikesPostTable)
          .where(
            and(
              eq(userLikesPostTable.userId, userId),
              eq(userLikesPostTable.postId, postId),
            ),
          )

        await tx
          .update(postTable)
          .set({ likesCount: sql`${postTable.likesCount} - 1` })
          .where(eq(postTable.id, postId))

        await tx
          .delete(userLikesTable)
          .where(
            and(
              eq(userLikesTable.userId, userId),
              eq(userLikesTable.likeableType, "post"),
              eq(userLikesTable.likeableId, postId),
            ),
          )
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "取消点赞动态失败",
      })
    }
  })
