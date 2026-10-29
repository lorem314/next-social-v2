"use client"

import Link from "next/link"
import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { useGlobalContext } from "@/components/global-context"
import { trpc } from "@/trpc/client"
import { useUserActionsContext } from "./user-actions-provider"

export function FollowButton({
  userId,
  isFollowed,
}: {
  userId: string
  isFollowed: boolean
}) {
  const globalContext = useGlobalContext()
  const userActionsContext = useUserActionsContext()

  const followMutation = trpc.user.follow.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (userActionsContext.onClickFollowButtonSuccess) {
        userActionsContext.onClickFollowButtonSuccess(userId, isFollowed)
      }
    },
  })

  const unfollowMutation = trpc.user.unfollow.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (userActionsContext.onClickFollowButtonSuccess) {
        userActionsContext.onClickFollowButtonSuccess(userId, isFollowed)
      }
    },
  })

  const handleClickFollow = async () => {
    await followMutation.mutateAsync({ userId })
  }

  const handleClickUnfollow = async () => {
    await unfollowMutation.mutateAsync({ userId })
  }

  return globalContext.user ? (
    isFollowed ? (
      <Button
        variant="secondary"
        onClick={handleClickUnfollow}
        disabled={unfollowMutation.isPending}
      >
        {unfollowMutation.isPending ? <Spinner /> : null}
        取消关注
      </Button>
    ) : (
      <Button onClick={handleClickFollow} disabled={followMutation.isPending}>
        {followMutation.isPending ? <Spinner /> : null}
        关注
      </Button>
    )
  ) : (
    <Link href="/auth/login">登录后可关注</Link>
  )
}
