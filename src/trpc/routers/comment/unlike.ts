import { eq, sql, and } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import {
  userTable,
  postTable,
  userLikesPostTable,
  commentTable,
  userLikesTable,
  userLikesCommentTable,
} from "@/drizzle/schema"

export const unlike = protectedProcedure
  .input(
    z.object({
      commentId: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const userId = opts.ctx.userId
    const commentId = opts.input.commentId

    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(userLikesCommentTable)
          .where(
            and(
              eq(userLikesCommentTable.userId, userId),
              eq(userLikesCommentTable.commentId, commentId),
            ),
          )

        await tx
          .update(commentTable)
          .set({ likesCount: sql`${commentTable.likesCount} - 1` })
          .where(eq(commentTable.id, commentId))

        await tx
          .delete(userLikesTable)
          .where(
            and(
              eq(userLikesTable.userId, userId),
              eq(userLikesTable.likeableType, "comment"),
              eq(userLikesTable.likeableId, commentId),
            ),
          )
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "取消点赞评论失败",
      })
    }
  })
