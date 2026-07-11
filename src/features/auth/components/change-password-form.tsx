"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { startTransition, useActionState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePasswordAction } from "@/features/auth/actions"
import { translateAuthMessage } from "@/features/auth/utils"
import { cn } from "@/lib/utils"

import { type ChangePasswordFormData, changePasswordSchema } from "../schemas"

export function ChangePasswordForm({
  className,
  hideHeader = false,
  showCancelButton = false,
  onCancel,
  onSuccess,
  cancelLabel,
}: {
  className?: string
  hideHeader?: boolean
  showCancelButton?: boolean
  onCancel?: () => void
  onSuccess?: () => void
  cancelLabel?: string
}) {
  const { t } = useTranslation("common")
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    {}
  )
  const lastErrorRef = useRef<string | null>(null)

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  useEffect(() => {
    if (!state.success) return

    toast.success(translateAuthMessage(t, state.message))
    form.reset()
    onSuccess?.()
  }, [form, onSuccess, state.message, state.success, t])

  useEffect(() => {
    if (!state.error || state.error === lastErrorRef.current) return

    lastErrorRef.current = state.error
    toast.error(translateAuthMessage(t, state.error))
  }, [state.error, t])

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
            <h1 className="text-2xl font-bold">
              {t("auth.changePassword.title")}
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              {t("auth.changePassword.subtitle")}
            </p>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="currentPassword">
            {t("auth.changePassword.currentPasswordLabel")}
          </FieldLabel>
          <Input
            id="currentPassword"
            type="password"
            placeholder={t("auth.changePassword.currentPasswordPlaceholder")}
            {...form.register("currentPassword")}
            aria-invalid={!!form.formState.errors.currentPassword}
          />
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(
                t,
                form.formState.errors.currentPassword.message
              )}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="newPassword">
            {t("auth.changePassword.newPasswordLabel")}
          </FieldLabel>
          <Input
            id="newPassword"
            type="password"
            placeholder={t("auth.changePassword.newPasswordPlaceholder")}
            {...form.register("newPassword")}
            aria-invalid={!!form.formState.errors.newPassword}
          />
          {form.formState.errors.newPassword && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(
                t,
                form.formState.errors.newPassword.message
              )}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmNewPassword">
            {t("auth.changePassword.confirmNewPasswordLabel")}
          </FieldLabel>
          <Input
            id="confirmNewPassword"
            type="password"
            placeholder={t("auth.changePassword.confirmNewPasswordPlaceholder")}
            {...form.register("confirmNewPassword")}
            aria-invalid={!!form.formState.errors.confirmNewPassword}
          />
          {form.formState.errors.confirmNewPassword && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(
                t,
                form.formState.errors.confirmNewPassword.message
              )}
            </p>
          )}
        </Field>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {translateAuthMessage(t, state.error)}
            </p>
          </div>
        )}

        {state.success && state.message && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              {translateAuthMessage(t, state.message)}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                onCancel?.()
              }}
              disabled={isPending}
            >
              {cancelLabel || t("dialog.close")}
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("auth.changePassword.submitting")
              : t("auth.changePassword.submit")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
