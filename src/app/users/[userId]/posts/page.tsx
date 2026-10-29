import { UserPosts } from "@/features/post/components/user-posts"

import { trpc, HydrateClient } from "@/trpc/server"

export default async function Page({
  params,
}: {
  params: Promise<{
    userId: string
  }>
}) {
  const { userId } = await params

  await trpc.post.list.prefetchInfinite({ userId, limit: 5 })

  return (
    <HydrateClient>
      <UserPosts userId={userId} />
    </HydrateClient>
  )
}
