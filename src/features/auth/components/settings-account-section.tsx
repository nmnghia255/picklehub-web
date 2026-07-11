"use client"

import { KeyRound, Link2, LogOut, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { logoutAction } from "@/features/auth/actions"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"
import { LinkFacebookButton } from "@/features/auth/components/link-facebook-button"
import { LinkGoogleButton } from "@/features/auth/components/link-google-button"
import { SetPasswordForm } from "@/features/auth/components/set-password-form"
import { UnlinkSocialAccountButton } from "@/features/auth/components/unlink-social-account-button"
import type { LinkedProvider, SocialProvider } from "@/features/auth/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

type PasswordMode = "change" | "set"

function getProviderMeta(provider: SocialProvider) {
  if (provider === "google") {
    return { labelKey: "edit.googleProvider" as const }
  }

  return { labelKey: "edit.facebookProvider" as const }
}

function PasswordDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: PasswordMode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation("common")
  const title =
    mode === "change"
      ? t("auth.changePassword.title")
      : t("auth.setPassword.title")
  const description =
    mode === "change"
      ? t("auth.changePassword.subtitle")
      : t("auth.setPassword.subtitle")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === "change" ? (
          <ChangePasswordForm
            hideHeader
            showCancelButton
            cancelLabel={t("dialog.close")}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        ) : (
          <SetPasswordForm
            hideHeader
            stayOnPage
            showCancelButton
            cancelLabel={t("dialog.close")}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PasswordSecurityCard() {
  const { t } = useTranslation("common")
  const [dialogMode, setDialogMode] = useState<PasswordMode | null>(null)

  const dialogOpen = dialogMode !== null

  return (
    <>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            {t("settingsPage.securityTitle")}
          </CardTitle>
          <CardDescription>{t("settingsPage.securityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => setDialogMode("change")}
              className="w-full sm:w-auto"
            >
              {t("auth.changePassword.submit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogMode("set")}
              className="w-full sm:w-auto"
            >
              {t("auth.setPassword.submit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {dialogMode && (
        <PasswordDialog
          mode={dialogMode}
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDialogMode(null)
            }
          }}
        />
      )}
    </>
  )
}

function SocialProviderCard({
  provider,
  linkedProvider,
}: {
  provider: SocialProvider
  linkedProvider?: LinkedProvider
}) {
  const { t } = useTranslation("common")
  const { t: tProfile, i18n } = useProfileTranslation()
  const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
  const providerMeta = getProviderMeta(provider)
  const providerLabel = tProfile(providerMeta.labelKey)

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <p className="font-medium">{providerLabel}</p>
          </div>
          <p className="text-sm break-words text-muted-foreground">
            {linkedProvider
              ? tProfile("edit.linkedAt", {
                  date: new Date(linkedProvider.linkedAt).toLocaleString(
                    locale
                  ),
                })
              : tProfile("edit.notLinked")}
          </p>
        </div>
        <Badge variant={linkedProvider ? "default" : "secondary"}>
          {linkedProvider
            ? tProfile("edit.linked")
            : tProfile("edit.notLinked")}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {linkedProvider ? (
          <UnlinkSocialAccountButton
            provider={provider}
            providerLabel={providerLabel}
            linkedAt={new Date(linkedProvider.linkedAt).toLocaleString(locale)}
          />
        ) : provider === "google" ? (
          <LinkGoogleButton />
        ) : (
          <LinkFacebookButton />
        )}
        {!linkedProvider && (
          <p className="text-xs text-muted-foreground">
            {t("settingsPage.linkProviderHint", { provider: providerLabel })}
          </p>
        )}
      </div>
    </div>
  )
}

function SessionActionsCard() {
  const { t } = useTranslation("common")

  return (
    <Card className="border-destructive/20 bg-destructive/5 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <LogOut className="size-4" />
          {t("settingsPage.sessionCardTitle")}
        </CardTitle>
        <CardDescription>{t("settingsPage.sessionCardDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {t("settingsPage.logoutBtn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SettingsAccountSection({
  linkedProviders,
}: {
  linkedProviders: LinkedProvider[]
}) {
  const { t } = useTranslation("common")
  const googleLinked = linkedProviders.find(
    (provider) => provider.provider === "google"
  )
  const facebookLinked = linkedProviders.find(
    (provider) => provider.provider === "facebook"
  )

  return (
    <section className="space-y-4" id="account">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("settingsPage.accountTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("settingsPage.accountDesc")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PasswordSecurityCard />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" />
              {t("settingsPage.linkedAccountsTitle")}
            </CardTitle>
            <CardDescription>
              {t("settingsPage.linkedAccountsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SocialProviderCard
                provider="google"
                linkedProvider={googleLinked}
              />
              <SocialProviderCard
                provider="facebook"
                linkedProvider={facebookLinked}
              />
            </div>

            {linkedProviders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("settingsPage.noLinkedAccounts")}
              </p>
            )}
          </CardContent>
        </Card>

        <SessionActionsCard />
      </div>
    </section>
  )
}
