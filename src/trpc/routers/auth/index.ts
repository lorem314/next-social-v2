import { createTRPCRouter } from "@/trpc/init"

import { signup } from "./signup"
import { login } from "./login"

export const authRouter = createTRPCRouter({
  signup,
  login,
})
