"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldError,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"

import { useForm } from "@tanstack/react-form"
import { trpc } from "@/trpc/client"
import { useGlobalContext } from "@/components/global-context"

export function NewComment({ postId }: { postId: string }) {
  const globalContext = useGlobalContext()

  const utils = trpc.useUtils()

  const createCommentMutation = trpc.comment.create.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      form.reset()
      utils.comment.list.setInfiniteData(
        { postId, parentId: null, limit: 5 },
        (prevData) => {
          if (!prevData) return prevData
          return {
            ...prevData,
            pages: [
              {
                ...prevData.pages[0],
                comments: [data, ...prevData.pages[0].comments],
              },
              ...prevData.pages.slice(1),
            ],
          }
        },
      )
    },
  })

  const form = useForm({
    defaultValues: { content: "" },
    onSubmit: async ({ value }) => {
      await createCommentMutation.mutateAsync({
        content: value.content,
        postId,
      })
    },
  })

  return (
    <Card className="mx-auto mt-8 max-w-2xl">
      <CardHeader>
        <CardTitle>发表评论</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.Field
                name="content"
                validators={{
                  onChangeAsyncDebounceMs: 250,
                  onChangeAsync: ({ value }) => {
                    if (!value) return "内容不能为空"
                  },
                }}
                children={(field) => (
                  <Field>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      disabled={!globalContext.user}
                    />
                    {!field.state.meta.isValid && (
                      <FieldError className="text-right">
                        {field.state.meta.errors.join()}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <Field orientation="horizontal" className="justify-end">
                {!!globalContext.user ? (
                  <Button type="submit">发表</Button>
                ) : (
                  <Link className="text-muted-foreground" href="/auth/login">
                    登陆后可发表评论
                  </Link>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}
