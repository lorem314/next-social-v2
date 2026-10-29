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

export const remove = protectedProcedure
  .input(z.object({ postId: z.string() }))
  .mutation(async (opts) => {
    const postId = opts.input.postId
    // console.log("[post/delete] postId", postId)
    try {
      await db.transaction(async (tx) => {
        const [removedPost] = await tx
          .delete(postTable)
          .where(eq(postTable.id, postId))
          .returning()

        if (!removedPost) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "该动态不存在",
          })
        }

        await tx
          .update(userTable)
          .set({ postsCount: sql`${userTable.postsCount} - 1` })
          .where(eq(userTable.id, removedPost.ownerId))
      })

      return { postId }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "删除动态失败",
      })
    }
  })
