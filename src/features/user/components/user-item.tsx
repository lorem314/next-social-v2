"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import { RouterOutputs } from "@/trpc/routers"
import { FollowButton } from "./follow-button"
import { useGlobalContext } from "@/components/global-context"

export function UserItem({
  user,
}: {
  user: RouterOutputs["user"]["list"]["users"][number]
}) {
  const globalContext = useGlobalContext()

  const isMyself = globalContext.user?.id == user.id

  return (
    <Item key={user.id}>
      {/* <pre>{JSON.stringify(user, undefined, 2)}</pre> */}
      <ItemMedia>
        <Link href={`/users/${user.id}`} className="no-underline">
          <Avatar className="size-12">
            <AvatarImage
              className="rounded-full border"
              src={`/api/users/${user.id}/avatar`}
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-bold">{user.name}</ItemTitle>
        <ItemDescription>{user.email}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {!isMyself && (
          <FollowButton userId={user.id} isFollowed={user.isFollowed} />
        )}
      </ItemActions>
    </Item>
  )
}
