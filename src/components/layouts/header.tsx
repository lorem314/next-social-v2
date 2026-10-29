"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "../ui/separator"

import { useGlobalContext } from "../global-context"

export function Header() {
  const globalContext = useGlobalContext()

  return (
    <header className="bg-secondary flex h-16 items-center justify-between border-b px-4">
      <Link className="font-bold" href="/">
        NEXT-SOCIAL
      </Link>
      <nav className="flex h-6 items-center gap-4">
        <Link href="/users">所有用户</Link>
        <Link href="/posts">所有动态</Link>
        <Separator orientation="vertical" />
        {globalContext.user ? (
          <>
            <Link
              className="flex items-center gap-2.5"
              href={`/users/${globalContext.user.id}`}
            >
              <Avatar className="size-10">
                <AvatarImage
                  className="border-chart-3 rounded-full border-2"
                  src={`/api/users/${globalContext.user.id}/avatar`}
                />
                <AvatarFallback>
                  {globalContext.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {globalContext.user.name}
            </Link>
            <Link href={`/users/${globalContext.user.id}/posts`}>动态</Link>
          </>
        ) : (
          <>
            <Button variant="outline">
              <Link href="/auth/signup">注册</Link>
            </Button>
            <Button>
              <Link href="/auth/login">登录</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
