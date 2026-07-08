"use client"

import { BoxIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"

import { translateAuthMessage } from "../utils"

type VerifyEmailStatus = "missing" | "error" | "success"

export function VerifyEmailResult({
  status,
  message,
}: {
  status: VerifyEmailStatus
  message?: string | null
}) {
  const { t } = useTranslation("common")

  return (
    <Layout>
      {status === "missing" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-yellow-500/10">
            <XCircleIcon className="size-8 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.verifyEmail.missingToken")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.verifyEmail.invalidLink")}
            </p>
          </div>
          <Field>
            <Link href="/register" className="w-full">
              <Button className="w-full">
                {t("auth.verifyEmail.backToRegister")}
              </Button>
            </Link>
          </Field>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircleIcon className="size-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.verifyEmail.failure")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {translateAuthMessage(t, message)}
            </p>
          </div>
          <Field>
            <Link href="/register" className="w-full">
              <Button className="w-full">
                {t("auth.verifyEmail.registerAgain")}
              </Button>
            </Link>
          </Field>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2Icon className="size-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.verifyEmail.success")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.verifyEmail.successDescription")}
            </p>
          </div>
          <Field>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                {t("auth.verifyEmail.loginNow")}
              </Button>
            </Link>
          </Field>
        </div>
      )}
    </Layout>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("common")

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
              <FieldGroup>{children}</FieldGroup>
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
