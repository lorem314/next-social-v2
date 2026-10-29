"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants, Button } from "@/components/ui/button"

import { usePostActionsContext } from "./post-actions-provider"
import { trpc } from "@/trpc/client"

export function RemoveButton({ postId }: { postId: string }) {
  const postActionsContext = usePostActionsContext()

  const removePostMutation = trpc.post.remove.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      if (postActionsContext.onClickRemoveButtonSuccess) {
        postActionsContext.onClickRemoveButtonSuccess(postId)
      }
    },
  })

  const handleClickRemoveButton = async () => {
    await removePostMutation.mutateAsync({ postId })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">删除</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要删除这个动态吗?</AlertDialogTitle>
          <AlertDialogDescription>
            该操作不可逆，将会永久删除这个动态。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            asChild
          >
            <Button onClick={handleClickRemoveButton}>删除</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
