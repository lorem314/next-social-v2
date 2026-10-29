import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import {
  userTable,
  postTable,
  commentTable,
  userLikesPostTable,
  userLikesTable,
  userLikesCommentTable,
} from "@/drizzle/schema"

export const like = protectedProcedure
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
        await tx.insert(userLikesCommentTable).values({ userId, commentId })

        await tx
          .update(commentTable)
          .set({ likesCount: sql`${commentTable.likesCount} + 1` })
          .where(eq(commentTable.id, commentId))

        await tx
          .insert(userLikesTable)
          .values({ userId, likeableType: "comment", likeableId: commentId })
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "点赞评论失败",
      })
    }
  })
