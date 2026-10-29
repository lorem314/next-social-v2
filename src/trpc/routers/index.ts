import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { createTRPCRouter } from "../init"
import { authRouter } from "./auth"
import { userRouter } from "./user"
import { postRouter } from "./post"
import { commentRouter } from "./comment"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
})

export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>
