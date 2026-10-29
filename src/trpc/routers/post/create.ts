import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, postTable } from "@/drizzle/schema"

export const create = protectedProcedure
  .input(
    z.object({
      content: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const ownerId = opts.ctx.userId
    const content = opts.input.content

    try {
      // console.log("create post")

      const [post] = await db.transaction(async (tx) => {
        const [newPost] = await tx
          .insert(postTable)
          .values({ content, ownerId })
          .returning()

        await tx
          .update(userTable)
          .set({ postsCount: sql`${userTable.postsCount} + 1` })
          .where(eq(userTable.id, ownerId))

        const [owner] = await tx
          .select({
            id: userTable.id,
            email: userTable.email,
            name: userTable.name,
          })
          .from(userTable)
          .where(eq(userTable.id, ownerId))

        return [
          {
            ...newPost,
            isLiked: false,
            owner,
          },
        ]
      })

      return post
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "发布动态失败",
      })
    }
  })
