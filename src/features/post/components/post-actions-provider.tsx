"use client"

import * as React from "react"

type PostActionsContextProps = {
  onClickLikeButtonSuccess?: (postId?: string, prevIsLiked?: boolean) => void
  onClickRemoveButtonSuccess?: (postId?: string) => void
}

export const PostActionsContext = React.createContext<PostActionsContextProps>({
  onClickLikeButtonSuccess: undefined,
  onClickRemoveButtonSuccess: undefined,
})

export function usePostActionsContext() {
  const context = React.useContext(PostActionsContext)
  if (!context) {
    throw new Error(
      "usePostActionsContext must be used within a <PostActionsContext.Provider />",
    )
  }
  return context
}
