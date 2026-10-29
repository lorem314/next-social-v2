import { eq, sql } from "drizzle-orm"
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

export const like = protectedProcedure
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
        await tx.insert(userLikesPostTable).values({ userId, postId })

        await tx
          .update(postTable)
          .set({ likesCount: sql`${postTable.likesCount} + 1` })
          .where(eq(postTable.id, postId))

        await tx
          .insert(userLikesTable)
          .values({ userId, likeableType: "post", likeableId: postId })
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "点赞动态失败",
      })
    }
  })
