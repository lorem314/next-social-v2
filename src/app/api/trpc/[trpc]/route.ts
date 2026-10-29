import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

// import { appRouter } from "@/trpc/server/routers"
import { appRouter } from "@/trpc/routers"
// import { getContext } from "@/trpc/server/context"
import { createTRPCContext } from "@/trpc/init"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
