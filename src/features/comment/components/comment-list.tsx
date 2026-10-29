"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
  ItemFooter,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

import { trpc } from "@/trpc/client"
import { CommentItem } from "./comment-item"
import { RouterOutputs } from "@/trpc/routers"

export function CommentList({
  comments,
  postId,
  parentId,
}: {
  comments: RouterOutputs["comment"]["list"]["comments"]
  postId: string
  parentId: string | null
}) {
  return (
    <ItemGroup>
      {comments.map((comment) => {
        return (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        )
      })}
    </ItemGroup>
  )
}
