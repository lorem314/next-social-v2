"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldError,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

import { useForm } from "@tanstack/react-form"
import { trpc } from "@/trpc/client"
import { useGlobalContext } from "@/components/global-context"

export function NewPost({ userId }: { userId: string }) {
  const utils = trpc.useUtils()

  const globalContent = useGlobalContext()

  const form = useForm({
    defaultValues: { content: "" },
    onSubmit: async ({ value }) => {
      const res = await createPostMutation.mutateAsync(value)
      console.log("[NewPost] createPostMutation res", res)
    },
  })

  const createPostMutation = trpc.post.create.useMutation({
    onError(error, variables, onMutateResult, context) {},
    onSuccess(data, variables, onMutateResult, context) {
      form.reset()
      utils.post.list.setInfiniteData({ userId, limit: 5 }, (prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          pages: [
            {
              ...prevData.pages[0],
              posts: [data, ...prevData.pages[0].posts],
            },
            ...prevData.pages.slice(1),
          ],
        }
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>发布动态</CardTitle>
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
                  onChange: ({ value }) => {
                    if (!value) return "内容不能为空"
                  },
                }}
              >
                {(field) => (
                  <Field>
                    {/* <FieldLabel htmlFor="feedback">新动态</FieldLabel> */}
                    <Textarea
                      placeholder="说些什么吧..."
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription className="text-right">
                      {field.state.value.length}/1000
                    </FieldDescription>
                    {!field.state.meta.isValid && (
                      <FieldError className="text-right">
                        {field.state.meta.errors.join()}
                      </FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              <Field orientation="horizontal" className="justify-end">
                <Button
                  type="submit"
                  //  disabled={createPostMutation.isPending}
                >
                  {/* {createPostMutation.isPending ? <Spinner /> : null} */}
                  发布
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}
