"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { trpc } from "@/trpc/client"
import { useGlobalContext } from "@/components/global-context"
import { usePostActionsContext } from "./post-actions-provider"

export function LikeButton({
  postId,
  isLiked,
  likesCount,
}: {
  postId: string
  isLiked: boolean
  likesCount: number
}) {
  const globalContext = useGlobalContext()
  const postActionsContext = usePostActionsContext()

  const likePostMutation = trpc.post.like.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (postActionsContext.onClickLikeButtonSuccess) {
        postActionsContext.onClickLikeButtonSuccess(postId, isLiked)
      }
    },
  })

  const unlikePostMutation = trpc.post.unlike.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (postActionsContext.onClickLikeButtonSuccess) {
        postActionsContext.onClickLikeButtonSuccess(postId, isLiked)
      }
    },
  })

  const handleClickLike = async () => {
    await likePostMutation.mutateAsync({ postId })
  }

  const handleClickUnlike = async () => {
    await unlikePostMutation.mutateAsync({ postId })
  }

  return globalContext.user ? (
    isLiked ? (
      <Button variant="outline" onClick={handleClickUnlike}>
        {unlikePostMutation.isPending ? <Spinner /> : <Heart fill="red" />}
        {likesCount}
      </Button>
    ) : (
      <Button variant="outline" onClick={handleClickLike}>
        {likePostMutation.isPending ? <Spinner /> : <Heart />}
        {likesCount}
      </Button>
    )
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="link" asChild>
          <Link href="/auth/login">
            <Heart />
            {likesCount}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>登录后可点赞</TooltipContent>
    </Tooltip>
  )
}
