"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { EyeOff, Eye } from "lucide-react"
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
import { authStore } from "@/store/auth"
import { useGlobalContext } from "@/components/global-context"

export default function Page() {
  const router = useRouter()

  const globalContext = useGlobalContext()

  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      console.log("[auth/login] value", value)
      try {
        const res = await loginMutation.mutateAsync(value)
        console.log("res", res)
      } catch (error) {
        console.log("[login] catch error", error)
      }
    },
  })

  const loginMutation = trpc.auth.login.useMutation({
    onError(error) {
      // console.log("[login] onError error", error.message)
      // console.log("[login] onError error.data", error.data)
      // if (error.data?.failedField) {
      //   const failedField = error.data.failedField
      //   form.setFieldMeta(failedField as "email" | "password", (meta) => {
      //     return {
      //       ...meta,
      //       errorMap: {
      //         onSubmit: error.message,
      //       },
      //     }
      //   })
      // }
    },
    onSuccess(data) {
      console.log("login success")
      console.log("accessToken", data.accessToken)
      toast.success("登录成功")
      authStore.saveAccessToken(data.accessToken)
      globalContext.setUser(data.user)
      router.push("/")
    },
  })

  return (
    <>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>通过邮箱和密码登入账号</CardDescription>
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
                  <Link href="/auth/signup">没有帐号，去注册</Link>
                </Button>
                <Button type="submit">登录</Button>
              </Field>
            </FieldSet>
          </form>
        </CardContent>
      </Card>

      {/* <Carousel className="mx-auto mt-16 w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 9 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel> */}
    </>
  )
}
