"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { NewComment } from "./new-comment"
import { CommentList } from "./comment-list"
import { trpc } from "@/trpc/client"
import { CommentActionsContext } from "./comment-actions-provider"

export function CommentSection({ postId }: { postId: string }) {
  const utils = trpc.useUtils()

  const listCommentQuery = trpc.comment.list.useInfiniteQuery(
    { postId, parentId: null, limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  if (listCommentQuery.isError) {
    throw listCommentQuery.error
  }

  const postByIdQuery = trpc.post.byId.useQuery({ postId })

  if (postByIdQuery.isError) {
    throw postByIdQuery.error
  }

  const handleClickLikeButtonSuccess = (
    commentId: string,
    prevIsLiked: boolean,
  ) => {
    utils.comment.list.setInfiniteData(
      { postId, parentId: null, limit: 5 },
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

  return (
    <>
      <NewComment postId={postId} />

      <Card className="mx-auto mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>所有评论 ({postByIdQuery.data?.commentsCount})</CardTitle>
        </CardHeader>

        <CardContent>
          {listCommentQuery.data?.pages.reduce((acc, page) => {
            return acc + page.comments.length
          }, 0) === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>没有评论</EmptyTitle>
                <EmptyDescription>目前还没有评论</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <CommentActionsContext.Provider
              value={{
                onClickLikeButtonSuccess: handleClickLikeButtonSuccess,
              }}
            >
              {listCommentQuery.data?.pages.map((page, index) => {
                return (
                  <CommentList
                    key={
                      page.nextCursor
                        ? new Date(page.nextCursor).getTime()
                        : index
                    }
                    comments={page.comments}
                    postId={postId}
                    parentId={null}
                  />
                )
              })}
            </CommentActionsContext.Provider>
          )}
        </CardContent>

        <CardFooter>
          {listCommentQuery.hasNextPage ? (
            <Field orientation="horizontal" className="justify-center">
              <Button
                variant="outline"
                onClick={() => listCommentQuery.fetchNextPage()}
              >
                {listCommentQuery.isFetchingNextPage && <Spinner />}
                {listCommentQuery.isFetchingNextPage
                  ? "加载中..."
                  : "加载更多评论"}
              </Button>
            </Field>
          ) : null}
        </CardFooter>
      </Card>
    </>
  )
}
