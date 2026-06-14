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
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-.8 2.4-1.8 3.1l2.8 2.2c1.6-1.5 2.6-3.7 2.6-6.4 0-.6-.1-1.2-.2-1.8H12z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.4 0 4.4-.8 5.9-2.2l-2.8-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8l-2.9 2.3C5.5 18.9 8.5 21 12 21z"
      />
      <path
        fill="#FBBC05"
        d="M6.9 13.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L4 8c-.7 1.2-1 2.6-1 4s.4 2.8 1 4l2.9-2.3z"
      />
      <path
        fill="#4285F4"
        d="M12 6.5c1.3 0 2.5.5 3.4 1.3L18 5.2C16.4 3.8 14.4 3 12 3 8.5 3 5.5 5.1 4 8l2.9 2.3c.7-2.2 2.7-3.8 5.1-3.8z"
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
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="rounded-lg border p-4">
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

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
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
