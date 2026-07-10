"use client"

import { ArrowLeft, KeyRound, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { logoutAction } from "@/features/auth/actions"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"
import type { LinkedProvider } from "@/features/auth/types"
import { EditProfileLinkedAccountsCard } from "@/features/profile/components/edit-profile/edit-profile-linked-accounts-card"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function AccountContent({
  linkedProviders,
}: {
  linkedProviders: LinkedProvider[]
}) {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const { t } = useProfileTranslation()

  return (
    <PageContainer className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold">
            {t("edit.manageAccount")}
          </h1>
          <Button variant="outline" asChild>
            <Link href="/profile/edit-profile">
              <ArrowLeft className="size-4" />
              {t("edit.back")}
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("edit.accountPageDesc")}
        </p>
      </div>

      {/* Linked accounts section taking full width */}
      <EditProfileLinkedAccountsCard linkedProviders={linkedProviders} />

      {/* Grid container with 2 columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Column 1: Change password section */}
        {!showChangePassword ? (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4" />
                {t("edit.security")}
              </CardTitle>
              <CardDescription>{t("edit.changePasswordIntro")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowChangePassword(true)}
                className="w-full cursor-pointer sm:w-auto"
              >
                {t("edit.changePassword")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-4" />
                  {t("edit.changePassword")}
                </CardTitle>
                <CardDescription>
                  {t("edit.changePasswordDesc")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChangePasswordForm hideHeader />
              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowChangePassword(false)}
                  className="cursor-pointer"
                >
                  {t("edit.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Column 2: Logout section */}
        <Card className="h-fit border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="size-4" />
              {t("edit.logout")}
            </CardTitle>
            <CardDescription>{t("edit.logoutDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="destructive"
                className="w-full cursor-pointer sm:w-auto"
              >
                {t("edit.logoutBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
