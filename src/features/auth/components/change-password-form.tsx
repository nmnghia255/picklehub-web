"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { startTransition, useActionState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePasswordAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

import { type ChangePasswordFormData, changePasswordSchema } from "../schemas"

export function ChangePasswordForm({
  className,
  hideHeader = false,
}: {
  className?: string
  hideHeader?: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    {}
  )

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("currentPassword", data.currentPassword)
    fd.set("newPassword", data.newPassword)
    fd.set("confirmNewPassword", data.confirmNewPassword)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        {!hideHeader && (
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
            </p>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="currentPassword">Mật khẩu hiện tại</FieldLabel>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            {...form.register("currentPassword")}
            aria-invalid={!!form.formState.errors.currentPassword}
          />
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="newPassword">Mật khẩu mới</FieldLabel>
          <Input
            id="newPassword"
            type="password"
            placeholder="Nhập mật khẩu mới"
            {...form.register("newPassword")}
            aria-invalid={!!form.formState.errors.newPassword}
          />
          {form.formState.errors.newPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmNewPassword">
            Nhập lại mật khẩu mới
          </FieldLabel>
          <Input
            id="confirmNewPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            {...form.register("confirmNewPassword")}
            aria-invalid={!!form.formState.errors.confirmNewPassword}
          />
          {form.formState.errors.confirmNewPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.confirmNewPassword.message}
            </p>
          )}
        </Field>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {state.success && state.message && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">{state.message}</p>
          </div>
        )}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
