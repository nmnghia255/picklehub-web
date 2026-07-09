"use client"

import { BoxIcon, Loader2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { acceptInvitationAction } from "@/features/groups/actions"

type State = "loading" | "error"

export function AcceptInvitationClient({ token }: { token?: string }) {
  const { t } = useTranslation("common")
  const router = useRouter()
  const [state, setState] = useState<State>(() =>
    !token ? "error" : "loading"
  )
  const [errorMessage, setErrorMessage] = useState(() =>
    !token ? t("invitation.accept.invalidLink") : ""
  )

  useEffect(() => {
    if (!token) return

    acceptInvitationAction(token).then((result) => {
      if (result.error) {
        setErrorMessage(result.error || t("invitation.accept.genericError"))
        setState("error")
        return
      }

      router.push("/groups/" + result.groupId)
    })
  }, [token, router, t])

  return (
    <Layout>
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2Icon className="size-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {t("invitation.accept.loadingTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("invitation.accept.loadingDescription")}
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
              {t("invitation.accept.errorTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Field>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                {t("invitation.accept.backToLogin")}
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
          alt={t("invitation.accept.imageAlt")}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
