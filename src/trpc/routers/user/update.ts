import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"

export const update = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const { ctx } = opts
    const { userId } = opts.input

    if (ctx.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "无权更改" })
    }

    try {
      await db
        .update(userTable)
        .set({ name: opts.input.name })
        .where(eq(userTable.id, opts.input.userId))
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "修改个人资料失败",
      })
    }
  })
