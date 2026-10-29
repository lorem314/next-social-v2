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
import { useCommentActionsContext } from "./comment-actions-provider"

export function LikeButton({
  commentId,
  isLiked,
  likesCount,
}: {
  commentId: string
  isLiked: boolean
  likesCount: number
}) {
  const globalContext = useGlobalContext()
  const commentActionsContent = useCommentActionsContext()

  const likeCommentMutation = trpc.comment.like.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (commentActionsContent.onClickLikeButtonSuccess) {
        commentActionsContent.onClickLikeButtonSuccess(commentId, isLiked)
      }
    },
  })

  const unlikeCommentMutation = trpc.comment.unlike.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (commentActionsContent.onClickLikeButtonSuccess) {
        commentActionsContent.onClickLikeButtonSuccess(commentId, isLiked)
      }
    },
  })

  const handleClickLike = async () => {
    await likeCommentMutation.mutateAsync({ commentId })
  }

  const handleClickUnlike = async () => {
    await unlikeCommentMutation.mutateAsync({ commentId })
  }

  return globalContext.user ? (
    isLiked ? (
      <Button variant="outline" size="sm" onClick={handleClickUnlike}>
        {unlikeCommentMutation.isPending ? <Spinner /> : <Heart fill="red" />}
        {likesCount}
      </Button>
    ) : (
      <Button variant="outline" size="sm" onClick={handleClickLike}>
        {likeCommentMutation.isPending ? <Spinner /> : <Heart />}
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
