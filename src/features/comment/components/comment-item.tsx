"use client"

import React from "react"
import Link from "next/link"
import { useForm } from "@tanstack/react-form"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { getTimeAgo } from "@/lib/utils"
import { RouterOutputs } from "@/trpc/routers"
import { useGlobalContext } from "@/components/global-context"
import { trpc } from "@/trpc/client"
import { CommentList } from "./comment-list"
import { LikeButton } from "./like-button"
import { CommentActionsContext } from "./comment-actions-provider"

export function CommentItem({
  comment,
  postId,
}: {
  comment: RouterOutputs["comment"]["list"]["comments"][number]
  postId: string
}) {
  const [showReply, setShowReply] = React.useState(false)

  const globalContext = useGlobalContext()

  const utils = trpc.useUtils()

  const listCommentQuery = trpc.comment.list.useInfiniteQuery(
    { postId, parentId: comment.id, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: false,
    },
  )

  if (listCommentQuery.isError) {
    throw listCommentQuery.error
  }

  const handleClickLikeButtonSuccess = (
    commentId: string,
    prevIsLiked: boolean,
  ) => {
    utils.comment.list.setInfiniteData(
      { postId, parentId: comment.id, limit: 5 },
      (prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          pages: prevData.pages.map((page) => {
            return {
              ...page,
              comments: page.comments.map((comment) => {
                return comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !prevIsLiked,
                      likesCount: comment.likesCount + (prevIsLiked ? -1 : 1),
                    }
                  : comment
              }),
            }
          }),
        }
      },
    )
  }

  const createCommentMutation = trpc.comment.create.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      setShowReply(false)
      form.reset()
      utils.comment.list.setInfiniteData(
        { limit: 5, postId, parentId: comment.id },
        (prevData) => {
          if (!prevData) {
            return {
              pages: [{ comments: [data], nextCursor: data.createdAt }],
              pageParams: [null],
            }
          } else {
            return {
              ...prevData,
              pages: [
                {
                  ...prevData.pages[0],
                  comments: [data, ...prevData.pages[0].comments],
                },
                ...prevData.pages.slice(1),
              ],
            }
          }
        },
      )
    },
  })

  const form = useForm({
    defaultValues: { content: "" },
    onSubmit: async ({ value }) => {
      // console.log("value", value)
      await createCommentMutation.mutateAsync({
        content: value.content,
        postId,
        parentId: comment.id,
      })
    },
  })

  const isMyself = globalContext.user?.id === comment.ownerId

  return (
    <Item>
      {/* <pre>{JSON.stringify(comment, undefined, 2)}</pre> */}
      <ItemMedia>
        <Avatar className="size-10">
          <AvatarImage src={`/api/users/${comment.ownerId}/avatar`} />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <span className="font-bold">{comment.owner?.name}</span>
          {` · `}
          <span>{getTimeAgo(comment.createdAt)}</span>
        </ItemTitle>

        <ItemDescription className="line-clamp-none text-pretty">
          {comment.content}
        </ItemDescription>

        <Field orientation="horizontal">
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReply((_) => !_)}
                // disabled={!globalContext.user}
              >
                回复
              </Button>
            </TooltipTrigger>
            {!globalContext.user ? (
              <TooltipContent>
                <p>登录后可回复</p>
              </TooltipContent>
            ) : null}
          </Tooltip> */}

          {!!globalContext.user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReply((_) => !_)}
              disabled={!globalContext.user}
            >
              回复
            </Button>
          ) : (
            <Link className="text-muted-foreground" href="/auth/login">
              登录后可回复
            </Link>
          )}

          <LikeButton
            commentId={comment.id}
            isLiked={comment.isLiked}
            likesCount={comment.likesCount}
          />
          <div className="grow" />
          {isMyself && (
            <Button type="button" variant="destructive" size="sm">
              删除
            </Button>
          )}
        </Field>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <React.Activity mode={showReply ? "visible" : "hidden"}>
            <form.Field
              name="content"
              children={(field) => {
                return (
                  <Field className="mt-2.5">
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      autoFocus
                      placeholder="在此输入回复..."
                    />
                  </Field>
                )
              }}
            />
            <Field orientation="horizontal" className="mt-2.5 justify-end">
              <Button type="button" variant="secondary" size="sm">
                取消
              </Button>
              <Button type="submit" size="sm">
                回复
              </Button>
            </Field>
          </React.Activity>
        </form>

        <ItemGroup>
          <CommentActionsContext.Provider
            value={{
              onClickLikeButtonSuccess: handleClickLikeButtonSuccess,
            }}
          >
            {listCommentQuery.isPending
              ? null
              : listCommentQuery.data.pages.map((page, index) => {
                  return (
                    <CommentList
                      key={
                        page.nextCursor
                          ? new Date(page.nextCursor).getTime()
                          : index
                      }
                      comments={page.comments}
                      postId={postId}
                      parentId={comment.id}
                    />
                  )
                })}
          </CommentActionsContext.Provider>
        </ItemGroup>

        {comment.commentsCount !== 0 ? (
          listCommentQuery.isPending ? (
            <Field orientation="horizontal">
              <Button
                variant="outline"
                size="sm"
                onClick={() => listCommentQuery.refetch()}
              >
                加载 {comment.commentsCount} 条回复
              </Button>
            </Field>
          ) : listCommentQuery.hasNextPage ? (
            <Field orientation="horizontal">
              <Button
                variant="outline"
                size="sm"
                onClick={() => listCommentQuery.fetchNextPage()}
              >
                加载更多回复
              </Button>
            </Field>
          ) : null
        ) : null}
      </ItemContent>
    </Item>
  )
}
