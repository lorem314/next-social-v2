"use client"

import { Newspaper } from "lucide-react"

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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { trpc } from "@/trpc/client"
import { PostList } from "./post-list"
import { PostActionsContext } from "./post-actions-provider"

export function AllPosts() {
  const utils = trpc.useUtils()

  const listPostQuery = trpc.post.list.useInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  if (listPostQuery.isError) {
    throw listPostQuery.error
  }

  const handleClickLikeButtonSuccess = (
    postId?: string,
    prevIsLiked?: boolean,
  ) => {
    utils.post.list.setInfiniteData({ limit: 5 }, (prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        pages: prevData.pages.map((page) => {
          return {
            ...page,
            posts: page.posts.map((post) => {
              return post.id === postId
                ? {
                    ...post,
                    isLiked: !prevIsLiked,
                    likesCount: post.likesCount + (prevIsLiked ? -1 : 1),
                  }
                : post
            }),
          }
        }),
      }
    })
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>所有动态</CardTitle>
      </CardHeader>

      <CardContent>
        {listPostQuery.data?.pages.reduce((acc, page) => {
          return acc + page.posts.length
        }, 0) === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Newspaper />
              </EmptyMedia>
              <EmptyTitle>没有动态</EmptyTitle>
              <EmptyDescription>没有找到动态</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <PostActionsContext.Provider
            value={{
              onClickLikeButtonSuccess: handleClickLikeButtonSuccess,
            }}
          >
            {listPostQuery.data?.pages.map((page, index) => {
              return (
                <PostList
                  key={
                    page.nextCursor
                      ? new Date(page.nextCursor).getTime()
                      : index
                  }
                  posts={page.posts}
                />
              )
            })}
          </PostActionsContext.Provider>
        )}
      </CardContent>

      <CardFooter>
        {listPostQuery.hasNextPage ? (
          <Field orientation="horizontal" className="justify-center">
            <Button
              variant="outline"
              onClick={() => listPostQuery.fetchNextPage()}
            >
              {listPostQuery.isFetchingNextPage && <Spinner />}
              {listPostQuery.isFetchingNextPage ? "加载中..." : "加载更多动态"}
            </Button>
          </Field>
        ) : null}
      </CardFooter>
    </Card>
  )
}
