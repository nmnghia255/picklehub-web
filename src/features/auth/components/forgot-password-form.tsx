"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { startTransition, useActionState } from "react"
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
import { forgotPasswordAction } from "@/features/auth/actions"
import { translateAuthMessage } from "@/features/auth/utils"
import { cn } from "@/lib/utils"

import { type ForgotPasswordFormData, forgotPasswordSchema } from "../schemas"

export function ForgotPasswordForm({ className }: { className?: string }) {
  const { t } = useTranslation("common")
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    {}
  )

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.forgotPassword.title")}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.forgotPassword.subtitle")}
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
              <FieldLabel htmlFor="email">
                {t("auth.forgotPassword.emailLabel")}
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {translateAuthMessage(t, form.formState.errors.email.message)}
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
                  ? t("auth.forgotPassword.submitting")
                  : t("auth.forgotPassword.submit")}
              </Button>
            </Field>
          </>
        )}

        <Field>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
