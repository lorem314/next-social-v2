import { cache } from "react"
import { cookies, headers } from "next/headers"
import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import jwt from "jsonwebtoken"

export const createTRPCContext = cache(async () => {
  const awaitedCookies = await cookies()
  const headersList = await headers()

  const refreshToken = awaitedCookies.get("refreshToken")?.value
  const accessToken = headersList.get("authorization")?.split(" ")[1]

  return {
    refreshToken,
    accessToken,
  }
})

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

const JWT_SECRET = process.env.JWT_SECRET as string

const hasLogin = t.middleware(({ ctx, next }) => {
  const accessToken = ctx.accessToken

  if (!accessToken) {
    throw new TRPCError({ code: "FORBIDDEN", message: "该请求需要先登录" })
  }

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as { userId: string }
    return next({ ctx: { userId: payload.userId } })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "accessToken 已过期",
      })
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "解析 accessToken 失败",
    })
  }
})

const getCurrentUser = t.middleware(({ ctx, next }) => {
  const accessToken = ctx.accessToken

  let currentUserId: string | null = null

  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, JWT_SECRET) as { userId: string }
      currentUserId = payload.userId
    } catch (error) {
      console.warn("Invalid accessToken in getCurrentUser:", error)
    }
  }

  if (!currentUserId) {
    const refreshToken = ctx.refreshToken // 从 cookies
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, JWT_SECRET) as {
          userId: string
        }
        currentUserId = payload.userId
      } catch (error) {
        console.warn("Invalid refreshToken in getCurrentUser:", error)
      }
    }
  }

  return next({ ctx: { currentUserId } })
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure.use(getCurrentUser)
export const protectedProcedure = t.procedure.use(hasLogin)
