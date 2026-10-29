import { createTRPCRouter } from "@/trpc/init"

import { create } from "./create"
import { list } from "./list"
import { like } from "./like"
import { unlike } from "./unlike"
import { byId } from "./by-id"
import { remove } from "./remove"

export const postRouter = createTRPCRouter({
  create,
  list,
  like,
  unlike,
  byId,
  remove,
})
