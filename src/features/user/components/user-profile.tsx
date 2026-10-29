"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

import { EditProfileButton } from "./edit-profile-button"
import { trpc } from "@/trpc/client"
import type { RouterOutputs } from "@/trpc/routers"
import { useGlobalContext } from "@/components/global-context"
import { FollowButton } from "./follow-button"
import { UpdateAvatarButton } from "./update-avatar-button"
import { UserActionsContext } from "./user-actions-provider"

export function UserProfile({ userId }: { userId: string }) {
  const globalContext = useGlobalContext()

  const utils = trpc.useUtils()

  const userByIdQuery = trpc.user.byId.useQuery({ userId })

  if (userByIdQuery.isError) {
    throw userByIdQuery.error
  }

  const handleClickFollowButtonSuccess = () => {
    utils.user.byId.setData({ userId }, (prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        isFollowed: !prevData.isFollowed,
        followeesCount:
          prevData.followeesCount + (prevData.isFollowed ? -1 : 1),
      }
    })
  }

  const isMyself = globalContext.user?.id === userId

  return userByIdQuery.isPending ? null : (
    <Card className="mx-auto max-w-xl">
      {/* <pre>{JSON.stringify(userByIdQuery.data, undefined, 2)}</pre> */}
      <CardHeader>
        <Item>
          <ItemMedia>
            <Avatar className="size-12">
              <AvatarImage
                className="rounded-full border"
                src={`/api/users/${userId}/avatar?v=${Date.now()}`}
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-base font-bold">
              {userByIdQuery.data.name}
            </ItemTitle>
            <ItemDescription className="">
              {userByIdQuery.data.email}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {isMyself ? (
              <>
                <UpdateAvatarButton userId={userId} />
                <EditProfileButton
                  userId={userId}
                  name={userByIdQuery.data.name}
                />
              </>
            ) : (
              <UserActionsContext.Provider
                value={{
                  onClickFollowButtonSuccess: handleClickFollowButtonSuccess,
                }}
              >
                <FollowButton
                  userId={userId}
                  isFollowed={userByIdQuery.data.isFollowed}
                />
              </UserActionsContext.Provider>
            )}
          </ItemActions>
        </Item>
      </CardHeader>

      <CardContent>
        <ItemGroup className="mx-6 flex flex-row gap-8">
          <Item variant="outline" className="grow" asChild>
            <Link className="hover:no-underline" href="">
              <ItemContent className="items-center">
                <ItemTitle className="text-muted-foreground font-bold">
                  关注
                </ItemTitle>
                <ItemDescription className="text-foreground text-xl">
                  {userByIdQuery.data.followersCount}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
          <Item variant="outline" className="grow" asChild>
            <Link className="hover:no-underline" href="">
              <ItemContent className="items-center">
                <ItemTitle className="text-muted-foreground font-bold">
                  粉丝
                </ItemTitle>
                <ItemDescription className="text-foreground text-xl">
                  {userByIdQuery.data.followeesCount}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
          <Item variant="outline" className="grow" asChild>
            <Link
              className="hover:no-underline"
              href={`/users/${userId}/posts`}
            >
              <ItemContent className="items-center">
                <ItemTitle className="text-muted-foreground font-bold">
                  动态
                </ItemTitle>
                <ItemDescription className="text-foreground text-xl">
                  {userByIdQuery.data.postsCount}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        </ItemGroup>
      </CardContent>

      <CardFooter className="mt-16">
        <div className="text-muted-foreground text-sm">
          该账号注册于 9999 年 99 月 99 日
        </div>
      </CardFooter>
    </Card>
  )
}
