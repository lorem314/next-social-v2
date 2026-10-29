import { createTRPCRouter } from "@/trpc/init"

import { byId } from "./by-id"
import { update } from "./update"
import { follow } from "./follow"
import { unfollow } from "./unfollow"
import { checkFollow } from "./check-follow"
import { list } from "./list"

export const userRouter = createTRPCRouter({
  byId,
  update,
  follow,
  unfollow,
  checkFollow,
  list,
})
