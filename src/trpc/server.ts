import { cache } from "react"
import { createHydrationHelpers } from "@trpc/react-query/rsc"

import { createCallerFactory, createTRPCContext } from "./init"
import { makeQueryClient } from "./query-client"
import { appRouter, AppRouter } from "./routers"

export const getQueryClient = cache(makeQueryClient)

const caller = createCallerFactory(appRouter)(createTRPCContext)

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
)
