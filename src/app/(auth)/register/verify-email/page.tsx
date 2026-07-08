"use client"

import { BoxIcon, MailIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { resendVerificationAction } from "@/features/auth/actions"
import { AuthLoadingFallback } from "@/features/auth/components/auth-loading-fallback"
import { translateAuthMessage } from "@/features/auth/utils"

function VerifyEmailContent() {
  const { t } = useTranslation("common")
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    {}
  )

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BoxIcon className="size-4" />
            </div>
            {t("brand")}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <MailIcon className="size-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                      {t("auth.registerVerifyEmail.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {t("auth.registerVerifyEmail.description")}
                    </p>
                    {email && <p className="text-sm font-medium">{email}</p>}
                    <p className="text-sm text-muted-foreground">
                      {t("auth.registerVerifyEmail.instruction")}
                    </p>
                  </div>
                </div>

                {state.success && (
                  <p className="text-center text-sm text-green-600">
                    {translateAuthMessage(t, state.message)}
                  </p>
                )}

                {state.error && (
                  <p className="text-center text-sm text-red-500">
                    {translateAuthMessage(t, state.error)}
                  </p>
                )}

                <Field>
                  <form action={formAction}>
                    <input type="hidden" name="email" value={email} />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!email || isPending}
                      className="w-full"
                    >
                      {isPending
                        ? t("auth.registerVerifyEmail.resending")
                        : t("auth.registerVerifyEmail.resendButton")}
                    </Button>
                  </form>
                </Field>

                <div className="text-center text-sm text-muted-foreground">
                  {t("auth.registerVerifyEmail.verified")}{" "}
                  <Link
                    href="/login"
                    className="font-medium underline underline-offset-4"
                  >
                    {t("auth.registerVerifyEmail.login")}
                  </Link>
                </div>
              </FieldGroup>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt={t("auth.alt.decorativeImage")}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
