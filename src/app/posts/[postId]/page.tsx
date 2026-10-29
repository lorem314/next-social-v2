import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { trpc, HydrateClient } from "@/trpc/server"
import { Post } from "@/features/post/components/post"
import { CommentSection } from "@/features/comment/components/comment-section"
import { NewComment } from "@/features/comment/components/new-comment"
import { CommentList } from "@/features/comment/components/comment-list"

export default async function Page({
  params,
}: {
  params: Promise<{
    postId: string
  }>
}) {
  const { postId } = await params

  await trpc.post.byId.prefetch({ postId })
  await trpc.comment.list.prefetchInfinite({
    postId,
    parentId: null,
    limit: 5,
  })

  return (
    <HydrateClient>
      <Post postId={postId} />

      <CommentSection postId={postId} />

      {/* <NewComment postId={postId} />

      <Card className="mx-auto mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>所有评论</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentList postId={postId} parentId={null} />
        </CardContent>
      </Card> */}
    </HydrateClient>
  )
}
