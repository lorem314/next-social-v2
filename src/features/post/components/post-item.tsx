"use client"

import React from "react"
import Link from "next/link"
import { MessageSquareMore } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemFooter,
} from "@/components/ui/item"

import { LikeButton } from "./like-button"
import type { RouterOutputs } from "@/trpc/routers"
import { getTimeAgo } from "@/lib/utils"

export function PostItem({
  post,
}: {
  post: RouterOutputs["post"]["list"]["posts"][number]
}) {
  const contentParts = post.content?.split("\n") || []

  return (
    <Item>
      <ItemMedia>
        <Avatar className="size-10">
          <AvatarImage
            className="rounded-full border"
            src={`/api/users/${post.ownerId}/avatar`}
          />
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          <span className="font-bold">{post.owner?.name}</span>
          {` · `}
          <span>{getTimeAgo(post.createdAt)}</span>
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {post.owner?.email}
        </ItemDescription>
      </ItemContent>

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

      <ItemFooter className="mt-4 justify-around">
        <Button asChild variant="outline">
          <Link href={`/posts/${post.id}`} className="no-underline">
            <MessageSquareMore />
            {post.commentsCount}
          </Link>
        </Button>

        <LikeButton
          postId={post.id}
          isLiked={post.isLiked}
          likesCount={post.likesCount}
        />
      </ItemFooter>
    </Item>
  )
}
