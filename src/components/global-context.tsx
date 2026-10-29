"use client"

import * as React from "react"
import { authStore } from "@/store/auth"

type GlobalContextProps = {
  user: {
    id: string
    email: string
    name: string
  } | null
  setUser: React.Dispatch<React.SetStateAction<GlobalContextProps["user"]>>
}

const GlobalContext = React.createContext<GlobalContextProps | null>(null)

export function GlobalContextProvider({
  children,
  initialUser,
  accessToken,
}: {
  children: React.ReactNode
  initialUser: GlobalContextProps["user"]
  accessToken: string | null
}) {
  const [user, setUser] =
    React.useState<GlobalContextProps["user"]>(initialUser)

  React.useEffect(() => {
    if (accessToken) {
      authStore.saveAccessToken(accessToken)
    }
  }, [])

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalContext() {
  const context = React.useContext(GlobalContext)
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider.",
    )
  }
  return context
}
