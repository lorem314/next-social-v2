"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import { useGlobalContext } from "@/components/global-context"
import { trpc } from "@/trpc/client"

export function EditProfileButton({
  userId,
  name,
}: {
  userId: string
  name: string
}) {
  const globalContext = useGlobalContext()

  const [open, setOpen] = React.useState(false)

  const utils = trpc.useUtils()

  const form = useForm({
    defaultValues: { name },
    onSubmit: async ({ value }) => {
      // console.log("value", value)
      await updateUserMutation.mutateAsync({ userId, name: value.name })
    },
  })

  const updateUserMutation = trpc.user.update.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      globalContext.setUser((prevUser) => {
        if (!prevUser) return prevUser
        return { ...prevUser, name: variables.name }
      })
      utils.user.byId.setData({ userId }, (prevData) => {
        if (!prevData) return prevData
        return { ...prevData, name: variables.name }
      })
      setOpen(false)
      toast.info("修改个人信息成功")
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">修改个人资料</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>修改个人资料</DialogTitle>
          <DialogDescription>
            在此处修改个人资料，点击保存更新
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </Field>
              )}
            </form.Field>
            <Field className="justify-end" orientation="horizontal">
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button type="submit">保存</Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
