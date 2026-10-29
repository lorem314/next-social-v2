"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MessageCircleMore,
  Heart,
  Trash2,
  MessageSquareMore,
  AlertCircleIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

import { trpc } from "@/trpc/client"
import { getTimeAgo } from "@/lib/utils"
import { LikeButton } from "./like-button"
import { PostActionsContext } from "./post-actions-provider"
import { useGlobalContext } from "@/components/global-context"
import { RemoveButton } from "./remove-button"

export function Post({ postId }: { postId: string }) {
  const globalContext = useGlobalContext()
  const router = useRouter()

  const utils = trpc.useUtils()
  const postByIdQuery = trpc.post.byId.useQuery({ postId })

  if (postByIdQuery.isError) {
    throw postByIdQuery.error
  }

  if (!postByIdQuery.data) {
    throw Error("没有找到动态")
  }

  const handleClickLikeButtonSuccess = () => {
    utils.post.byId.setData({ postId }, (prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        isLiked: !prevData.isLiked,
        likesCount: prevData.likesCount + (prevData.isLiked ? -1 : 1),
      }
    })
  }

  const handleClickRemoveButtonSuccess = (postId?: string) => {
    utils.post.list.setInfiniteData(
      { userId: postByIdQuery.data.ownerId, limit: 5 },
      (prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          pages: prevData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.filter((post) => {
                return post.id !== postId
              }),
            }
          }),
        }
      },
    )
    router.replace(`/users/${postByIdQuery.data.ownerId}/posts`)
  }

  const contentParts = postByIdQuery.data.content?.split("\n") || []
  const isMyself = globalContext.user?.id === postByIdQuery.data.ownerId

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <Item>
          <ItemMedia>
            <Avatar className="size-12">
              <AvatarImage
                className="rounded-full border"
                src={`/api/users/${postByIdQuery.data.ownerId}/avatar`}
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <span className="font-bold">
                {postByIdQuery.data.owner?.name}
              </span>
              {` · `}
              <span>{getTimeAgo(postByIdQuery.data.createdAt)}</span>
            </ItemTitle>
            <ItemDescription className="line-clamp-none">
              {postByIdQuery.data.owner?.email}
            </ItemDescription>
          </ItemContent>
        </Item>
      </CardHeader>

      <CardContent>
        <p className="w-full px-8">
          {contentParts.map((part, index) => {
            return (
              <React.Fragment key={index}>
                {part}
                {index < contentParts?.length - 1 && <br />}
              </React.Fragment>
            )
          })}
        </p>
      </CardContent>

      <CardFooter className="mt-8 justify-around">
        <PostActionsContext.Provider
          value={{
            onClickLikeButtonSuccess: handleClickLikeButtonSuccess,
            onClickRemoveButtonSuccess: handleClickRemoveButtonSuccess,
          }}
        >
          <LikeButton
            postId={postByIdQuery.data.id}
            isLiked={postByIdQuery.data.isLiked}
            likesCount={postByIdQuery.data.likesCount}
          />
          {isMyself && <RemoveButton postId={postId} />}
        </PostActionsContext.Provider>
      </CardFooter>
    </Card>
  )
}
