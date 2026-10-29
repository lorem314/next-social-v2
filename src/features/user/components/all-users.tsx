"use client"

import Link from "next/link"
import { User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

import { trpc } from "@/trpc/client"
import { UserList } from "./user-list"
import { UserActionsContext } from "./user-actions-provider"

export function AllUsers() {
  const utils = trpc.useUtils()

  const listUserQuery = trpc.user.list.useInfiniteQuery(
    { limit: 5 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  if (listUserQuery.isError) {
    throw listUserQuery.error
  }

  const handleClickFollowButtonSuccess = (
    userId?: string,
    prevIsFollowed?: boolean,
  ) => {
    utils.user.list.setInfiniteData({ limit: 5 }, (prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        pages: prevData.pages.map((page) => {
          return {
            ...page,
            users: page.users.map((user) => {
              return user.id === userId
                ? {
                    ...user,
                    isFollowed: !prevIsFollowed,
                    followeesCount:
                      user.followeesCount + (prevIsFollowed ? -1 : 1),
                  }
                : user
            }),
          }
        }),
      }
    })
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>所有用户</CardTitle>
      </CardHeader>

      <CardContent>
        {listUserQuery.data?.pages.reduce((acc, page) => {
          return acc + page.users.length
        }, 0) === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <User />
              </EmptyMedia>
              <EmptyTitle>暂时还没有用户</EmptyTitle>
            </EmptyHeader>
            {/* <EmptyContent>
              <div className="flex gap-2">
                <Button>Create Project</Button>
                <Button variant="outline">Import Project</Button>
              </div>
            </EmptyContent> */}
          </Empty>
        ) : (
          <UserActionsContext.Provider
            value={{
              onClickFollowButtonSuccess: handleClickFollowButtonSuccess,
            }}
          >
            {listUserQuery.data?.pages.map((page, index) => {
              return (
                <UserList
                  key={
                    page.nextCursor
                      ? new Date(page.nextCursor).getTime()
                      : index
                  }
                  users={page.users}
                />
              )
            })}
          </UserActionsContext.Provider>
        )}
      </CardContent>

      <CardFooter>
        {listUserQuery.hasNextPage ? (
          <Field orientation="horizontal" className="justify-center">
            <Button
              variant="outline"
              onClick={() => listUserQuery.fetchNextPage()}
            >
              {listUserQuery.isFetchingNextPage && <Spinner />}
              {listUserQuery.isFetchingNextPage ? "加载中..." : "加载更多用户"}
            </Button>
          </Field>
        ) : null}
      </CardFooter>
    </Card>
  )
}
