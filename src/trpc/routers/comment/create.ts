import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, postTable, commentTable } from "@/drizzle/schema"

export const create = protectedProcedure
  .input(
    z.object({
      content: z.string(),
      postId: z.string(),
      parentId: z.string().nullish(),
    }),
  )
  .mutation(async (opts) => {
    const content = opts.input.content
    const postId = opts.input.postId
    const parentId = opts.input.parentId || null
    const ownerId = opts.ctx.userId

    try {
      const comment = await db.transaction(async (tx) => {
        const [newComment] = await tx
          .insert(commentTable)
          .values({ content, ownerId, postId, parentId })
          .returning()

        if (parentId) {
          await tx
            .update(commentTable)
            .set({ commentsCount: sql`${commentTable.commentsCount} + 1` })
            .where(eq(commentTable.id, parentId))
        }

        await tx
          .update(postTable)
          .set({ commentsCount: sql`${postTable.commentsCount} + 1` })
          .where(eq(postTable.id, postId))

        return newComment
      })

      const [owner] = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        })
        .from(userTable)
        .where(eq(userTable.id, ownerId))

      return { ...comment, owner, isLiked: false }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "发表评论失败",
      })
    }
  })
