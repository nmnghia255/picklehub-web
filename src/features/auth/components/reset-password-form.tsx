"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { startTransition, useActionState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { resetPasswordAction } from "@/features/auth/actions"
import { translateAuthMessage } from "@/features/auth/utils"
import { cn } from "@/lib/utils"

import { type ResetPasswordFormData, resetPasswordSchema } from "../schemas"

export function ResetPasswordForm({
  token,
  className,
}: {
  token: string
  className?: string
}) {
  const { t } = useTranslation("common")
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {})

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  useEffect(() => {
    form.setValue("token", token)
  }, [form, token])

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("token", data.token)
    fd.set("newPassword", data.newPassword)
    fd.set("confirmNewPassword", data.confirmNewPassword)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.resetPassword.title")}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.resetPassword.subtitle")}
          </p>
        </div>

        {state.success ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              {translateAuthMessage(t, state.message)}
            </p>
          </div>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="newPassword">
                {t("auth.resetPassword.newPasswordLabel")}
              </FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
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
                {t("auth.resetPassword.confirmNewPasswordLabel")}
              </FieldLabel>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder={t(
                  "auth.resetPassword.confirmNewPasswordPlaceholder"
                )}
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

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("auth.resetPassword.submitting")
                  : t("auth.resetPassword.submit")}
              </Button>
            </Field>
          </>
        )}

        <Field>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              {t("auth.resetPassword.backToLogin")}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function ResetPasswordMissingToken() {
  const { t } = useTranslation("common")

  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
      {t("auth.resetPassword.missingToken")}
    </div>
  )
}
