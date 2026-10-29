import { UserProfile } from "@/features/user/components/user-profile"
import { trpc, HydrateClient } from "@/trpc/server"

export default async function Page({
  params,
}: {
  params: Promise<{
    userId: string
  }>
}) {
  const { userId } = await params

  await trpc.user.byId.prefetch({ userId })

  return (
    <HydrateClient>
      <UserProfile userId={userId} />
    </HydrateClient>
  )
}
