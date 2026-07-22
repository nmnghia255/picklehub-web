"use client"

import { CheckCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { verifyMagicLinkAction } from "@/features/auth/actions"
import { AuthBrandLink } from "@/features/auth/components/auth-brand-link"
import { translateAuthMessage } from "@/features/auth/utils"

type State = "loading" | "success" | "error"

export function MagicLinkVerifyClient({ magic }: { magic?: string }) {
  const { t } = useTranslation("common")
  const router = useRouter()
  const [state, setState] = useState<State>(() =>
    !magic ? "error" : "loading"
  )
  const [errorMessage, setErrorMessage] = useState(() =>
    !magic ? t("auth.magicLinkVerify.invalidLink") : ""
  )

  useEffect(() => {
    if (!magic) return

    verifyMagicLinkAction(magic).then((result) => {
      if (result.error) {
        setErrorMessage(translateAuthMessage(t, result.error))
        setState("error")
        return
      }

      setState("success")
      router.push("/")
    })
  }, [magic, router, t])

  return (
    <Layout>
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2Icon className="size-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.magicLinkVerify.loading")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.magicLinkVerify.loadingDescription")}
            </p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircleIcon className="size-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.magicLinkVerify.success")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.magicLinkVerify.successDescription")}
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircleIcon className="size-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("auth.magicLinkVerify.failure")}
            </h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Field>
            <Link href="/magic-link" className="w-full">
              <Button className="w-full">
                {t("auth.magicLinkVerify.resendButton")}
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
          <AuthBrandLink />
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
