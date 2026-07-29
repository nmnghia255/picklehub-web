"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { startTransition, useActionState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

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
import { translateAuthMessage } from "@/features/auth/utils"
import { cn } from "@/lib/utils"

import { type LoginFormData, loginSchema } from "../schemas"
import { FacebookAuthButton } from "./facebook-auth-button"
import { GoogleAuthButton } from "./google-auth-button"

export function LoginForm({ className }: { className?: string }) {
  const { t } = useTranslation("common")
  const searchParams = useSearchParams()
  const redirectTarget =
    searchParams.get("redirect") || searchParams.get("returnUrl") || ""
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
    if (redirectTarget) {
      fd.set("redirect", redirectTarget)
    }
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("auth.login.title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">{t("auth.login.emailLabel")}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.login.emailPlaceholder")}
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(t, form.formState.errors.email.message)}
            </p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">
              {t("auth.login.passwordLabel")}
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.login.passwordPlaceholder")}
            {...form.register("password")}
            aria-invalid={!!form.formState.errors.password}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {translateAuthMessage(t, form.formState.errors.password.message)}
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
            {isPending ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </Field>

        <FieldSeparator>{t("auth.login.separator")}</FieldSeparator>

        <Field>
          <GoogleAuthButton text="signin_with" />
          <FacebookAuthButton title={t("auth.login.facebookButton")} />
          <FieldDescription className="text-center">
            {t("auth.login.noAccount")}{" "}
            <Link href="/register" className="underline underline-offset-4">
              {t("auth.login.registerLink")}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
