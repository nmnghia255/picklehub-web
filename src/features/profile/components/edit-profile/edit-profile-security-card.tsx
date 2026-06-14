"use client"

import { KeyRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { logoutAction } from "@/features/auth/actions"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function EditProfileSecurityCard() {
  const { t } = useProfileTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" />
          {t("edit.security")}
        </CardTitle>
        <CardDescription>{t("edit.securityDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/change-password">{t("edit.changePassword")}</Link>
        </Button>

        <form action={logoutAction} className="pt-1">
          <Button
            type="submit"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {t("edit.logout")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
