"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { startTransition, useActionState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { registerAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

import { type RegisterFormData, registerSchema } from "../schemas"
import { FacebookAuthButton } from "./facebook-auth-button"
import { GoogleAuthButton } from "./google-auth-button"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(registerAction, {})

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    fd.set("password", data.password)
    fd.set("name", data.name)
    startTransition(() => formAction(fd))
  })

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng ký PickleHub</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Nhập Email của bạn bên dưới để đăng ký.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Nguyễn Văn A"
            {...form.register("name")}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="hoten@example.com"
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu"
            {...form.register("password")}
            aria-invalid={!!form.formState.errors.password}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </Field>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </Field>

        <FieldSeparator>hoặc tiếp tục với</FieldSeparator>

        <Field>
          <GoogleAuthButton text="signup_with" />
          <FacebookAuthButton title="Đăng ký với Facebook" />

          <FieldDescription className="text-center">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Đăng nhập
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
