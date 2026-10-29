"use client"

import React from "react"
import Link from "next/link"
import { EyeOff, Eye } from "lucide-react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { trpc } from "@/trpc/client"

export default function Page() {
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      console.log("[auth/signup] value", value)
      await signupMutation.mutateAsync(value)
    },
  })

  const signupMutation = trpc.auth.signup.useMutation({
    onError(error, variables, onMutateResult, context) {
      console.error("[auth/signup] error", error)
      toast.error("注册账号失败")
    },
    onSuccess(data, variables, onMutateResult, context) {
      console.log("成功注册账号")
      toast.success("注册账号成功")
    },
  })

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>注册</CardTitle>
        <CardDescription>通过邮箱和密码创建账号</CardDescription>
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
              {/*  */}

              {/* name */}
              <form.Field
                name="name"
                validators={{
                  onChangeAsyncDebounceMs: 250,
                  onChangeAsync: ({ value }) => {
                    if (!value) return "用户名不能为空"
                  },
                }}
              >
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="user999"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                      {!field.state.meta.isValid && (
                        <FieldError className="text-right">
                          {field.state.meta.errors.join()}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* email */}
              <form.Field
                name="email"
                validators={{
                  onChangeAsyncDebounceMs: 500,
                  onChangeAsync: async ({ value }) => {
                    if (!value) return "邮箱不能为空"
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return "邮箱格式不正确"
                  },
                }}
              >
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>邮箱</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="abc@xyz.com"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                      {!field.state.meta.isValid && (
                        <FieldError className="text-right">
                          {field.state.meta.errors.join()}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* password */}
              <form.Field
                name="password"
                validators={{
                  onChangeAsyncDebounceMs: 250,
                  onChangeAsync: ({ value }) => {
                    if (!value) return "密码不能为空"
                    if (value.length < 6) return "密码至少要有 6 位数字"
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>密码</FieldLabel>
                    <div className="flex space-x-2.5">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowPassword((_) => !_)}
                      >
                        {showPassword ? <Eye /> : <EyeOff />}
                      </Button>
                    </div>
                    {!field.state.meta.isValid && (
                      <FieldError className="text-right">
                        {field.state.meta.errors.join()}
                      </FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              {/*  */}
            </FieldGroup>

            <Field className="justify-around" orientation="horizontal">
              <Button variant="link" type="button">
                <Link href="/auth/login">已有帐号，去登陆</Link>
              </Button>
              <Button type="submit">注册</Button>
            </Field>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}
