"use client"

import { ItemGroup } from "@/components/ui/item"

import { PostItem } from "./post-item"
import { RouterOutputs } from "@/trpc/routers"

export function PostList({
  posts,
}: {
  posts: RouterOutputs["post"]["list"]["posts"]
}) {
  return (
    <ItemGroup>
      {posts.map((post) => {
        return <PostItem key={post.id} post={post} />
      })}
    </ItemGroup>
  )
}
