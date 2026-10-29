import { trpc, HydrateClient } from "@/trpc/server"
import { AllUsers } from "@/features/user/components/all-users"

export default async function Page() {
  await trpc.user.list.prefetchInfinite({ limit: 5 })

  return (
    <HydrateClient>
      <AllUsers />
    </HydrateClient>
  )
}
