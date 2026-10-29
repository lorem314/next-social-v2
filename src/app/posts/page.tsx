import { trpc, HydrateClient } from "@/trpc/server"
import { AllPosts } from "@/features/post/components/all-posts"

export default async function Page() {
  await trpc.post.list.prefetchInfinite({ limit: 5 })

  return (
    <HydrateClient>
      <AllPosts />
    </HydrateClient>
  )
}
