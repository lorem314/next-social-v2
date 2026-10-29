import crypto from "crypto"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import jwt from "jsonwebtoken"

import { publicProcedure } from "@/trpc/init"
import { db } from "@/drizzle/db"
import { userTable, refreshTokenTable } from "@/drizzle/schema"
import { config } from "@/config"

const JWT_SECRET = process.env.JWT_SECRET as string

export const login = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts

    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, input.email))

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "邮箱未被注册",
        cause: { failedField: "email" as const },
      })
    }

    const hashedPassword = crypto
      .createHmac("sha1", user.salt)
      .update(input.password)
      .digest("hex")

    if (hashedPassword !== user.hashedPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "密码不正确",
        cause: { failedField: "password" as const },
      })
    }

    const payload = { userId: user.id }
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: config.ACCESS_TOKEN_EXP,
    })
    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXP,
    })

    await db.insert(refreshTokenTable).values({
      value: refreshToken,
      ownerId: user.id,
    })

    const awaitedCookies = await cookies()
    awaitedCookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  })
