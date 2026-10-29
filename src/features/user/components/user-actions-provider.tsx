"use client"

import * as React from "react"

type UserActionsContextProps = {
  onClickFollowButtonSuccess?: (
    userId?: string,
    prevIsFollowed?: boolean,
  ) => void
}

export const UserActionsContext = React.createContext<UserActionsContextProps>({
  onClickFollowButtonSuccess: undefined,
})

export function useUserActionsContext() {
  const context = React.useContext(UserActionsContext)
  if (!context) {
    throw new Error(
      "useUserActionsContext must be used within a <UserActionsContext.Provider />",
    )
  }
  return context
}
