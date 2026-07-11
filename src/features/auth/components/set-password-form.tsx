"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { startTransition, useActionState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { setPasswordAction } from "@/features/auth/actions"
import { translateAuthMessage } from "@/features/auth/utils"
import { cn } from "@/lib/utils"

import { type SetPasswordFormData, setPasswordSchema } from "../schemas"

export function SetPasswordForm({
  groupId,
  redirectTo,
  onSuccess,
  className,
  hideHeader = false,
  stayOnPage = false,
  showCancelButton = false,
  onCancel,
  cancelLabel,
}: {
  groupId?: string
  redirectTo?: string
  onSuccess?: () => void
  className?: string
  hideHeader?: boolean
  stayOnPage?: boolean
  showCancelButton?: boolean
  onCancel?: () => void
  cancelLabel?: string
}) {
  const { t } = useTranslation("common")
  const [state, formAction, isPending] = useActionState(setPasswordAction, {})
  const lastErrorRef = useRef<string | null>(null)

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
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
    fd.set("password", data.password)
    fd.set("confirmPassword", data.confirmPassword)
    if (groupId) fd.set("groupId", groupId)
    if (redirectTo) fd.set("redirectTo", redirectTo)
    if (stayOnPage) fd.set("stayOnPage", "true")
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        {!hideHeader && (
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">
              {t("auth.setPassword.title")}
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              {t("auth.setPassword.subtitle")}
            </p>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="password">
            {t("auth.setPassword.passwordLabel")}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.setPassword.passwordPlaceholder")}
            {...form.register("password")}
            aria-invalid={!!form.formState.errors.password}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(t, form.formState.errors.password.message)}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            {t("auth.setPassword.confirmPasswordLabel")}
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("auth.setPassword.confirmPasswordPlaceholder")}
            {...form.register("confirmPassword")}
            aria-invalid={!!form.formState.errors.confirmPassword}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(
                t,
                form.formState.errors.confirmPassword.message
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
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending
              ? t("auth.setPassword.submitting")
              : t("auth.setPassword.submit")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
