"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { startTransition, useActionState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { setPasswordAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

import { type SetPasswordFormData, setPasswordSchema } from "../schemas"

export function SetPasswordForm({
  groupId,
  className,
}: {
  groupId?: string
  className?: string
}) {
  const { t } = useTranslation("common")
  const [state, formAction, isPending] = useActionState(setPasswordAction, {})

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("password", data.password)
    fd.set("confirmPassword", data.confirmPassword)
    if (groupId) fd.set("groupId", groupId)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.setPassword.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.setPassword.subtitle")}
          </p>
        </div>

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
              {form.formState.errors.password.message}
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
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </Field>

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        <Field>
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending
              ? t("auth.setPassword.submitting")
              : t("auth.setPassword.submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
