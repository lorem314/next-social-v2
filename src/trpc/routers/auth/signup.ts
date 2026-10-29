import crypto from "crypto"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"

export const signup = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.email({ message: "邮箱不符合格式" }),
      password: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts
    console.log("[auth/signup] input", input)

    const salt = Math.round(new Date().valueOf() * Math.random()) + ""

    let hashedPassword
    try {
      hashedPassword = crypto
        .createHmac("sha1", salt)
        .update(input.password)
        .digest("hex")
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "加密密码时出错",
      })
    }

    const values = {
      name: input.name,
      email: input.email,
      hashedPassword,
      salt,
    }
    // console.log("values", values)

    try {
      await db.insert(userTable).values(values)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "保存用户时出错",
      })
    }
  })
