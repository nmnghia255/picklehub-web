"use client"

import { ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LinkFacebookButton } from "@/features/auth/components/link-facebook-button"
import { LinkGoogleButton } from "@/features/auth/components/link-google-button"
import type { LinkedProvider } from "@/features/auth/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        transform="translate(0.5, 0)"
        d="M13.4 8.3h1.8V5.9h-2.1c-2.3 0-3.5 1.4-3.5 3.6v1.8H8v2.4h1.6v4.4h2.6v-4.4h2l.4-2.4h-2.4V9.8c0-.8.2-1.5 1.2-1.5z"
      />
    </svg>
  )
}

export function EditProfileLinkedAccountsCard({
  linkedProviders,
}: {
  linkedProviders: LinkedProvider[]
}) {
  const { t, i18n } = useProfileTranslation()
  const locale = i18n.language === "vi" ? "vi-VN" : "en-US"

  const googleLinked = linkedProviders.find((lp) => lp.provider === "google")
  const facebookLinked = linkedProviders.find(
    (lp) => lp.provider === "facebook"
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          {t("edit.linkedAccounts")}
        </CardTitle>
        <CardDescription>{t("edit.linkedAccountsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-6">
          <div className="overflow-hidden rounded-lg border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <GoogleIcon />
                  Google
                </p>
                <p className="text-sm text-muted-foreground">
                  {googleLinked
                    ? t("edit.linkedAt", {
                        date: new Date(googleLinked.linkedAt).toLocaleString(
                          locale
                        ),
                      })
                    : t("edit.notLinked")}
                </p>
              </div>
              <Badge variant={googleLinked ? "default" : "secondary"}>
                {googleLinked ? t("edit.linked") : t("edit.notLinked")}
              </Badge>
            </div>

            {!googleLinked && <LinkGoogleButton />}
          </div>

          <div className="overflow-hidden rounded-lg border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="w-full">
                <p className="flex items-center gap-2 font-medium">
                  <FacebookIcon />
                  Facebook
                </p>
                <p className="text-sm text-muted-foreground">
                  {facebookLinked
                    ? t("edit.linkedAt", {
                        date: new Date(facebookLinked.linkedAt).toLocaleString(
                          locale
                        ),
                      })
                    : t("edit.notLinked")}
                </p>
              </div>
              <Badge variant={facebookLinked ? "default" : "secondary"}>
                {facebookLinked ? t("edit.linked") : t("edit.notLinked")}
              </Badge>
            </div>

            {!facebookLinked && <LinkFacebookButton />}
          </div>

          {linkedProviders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("edit.noLinked")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
