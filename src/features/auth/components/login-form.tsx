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
import { loginAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

import { type LoginFormData, loginSchema } from "../schemas"
import { FacebookAuthButton } from "./facebook-auth-button"
import { GoogleAuthButton } from "./google-auth-button"

export function LoginForm({ className }: { className?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, {})

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    fd.set("password", data.password)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập PickleHub</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Nhập Email của bạn bên dưới để đăng nhập.
          </p>
        </div>

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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <button
              type="button"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              tabIndex={-1}
            >
              Quên mật khẩu?
            </button>
          </div>
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
            {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Field>

        <FieldSeparator>hoặc tiếp tục với</FieldSeparator>

        <Field>
          <GoogleAuthButton text="signin_with" />
          <FacebookAuthButton title="Đăng nhập với Facebook" />
          <FieldDescription className="text-center">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Đăng ký
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
