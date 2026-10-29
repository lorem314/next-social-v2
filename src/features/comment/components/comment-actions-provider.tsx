"use client"

import * as React from "react"

type CommentActionsContextProps = {
  onClickLikeButtonSuccess?: (commentId: string, prevIsLiked: boolean) => void
  // onClickRemoveButtonSuccess?: (postId?: string) => void
}

export const CommentActionsContext =
  React.createContext<CommentActionsContextProps>({
    onClickLikeButtonSuccess: undefined,
    // onClickRemoveButtonSuccess: undefined,
  })

export function useCommentActionsContext() {
  const context = React.useContext(CommentActionsContext)
  if (!context) {
    throw new Error(
      "useCommentActionsContext must be used within a <CommentActionsContext.Provider />",
    )
  }
  return context
}
