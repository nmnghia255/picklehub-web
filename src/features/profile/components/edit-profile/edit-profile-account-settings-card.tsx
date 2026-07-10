"use client"

import { Settings } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function EditProfileAccountSettingsCard() {
  const { t } = useProfileTranslation()

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-4" />
          {t("edit.accountSettings")}
        </CardTitle>
        <CardDescription>{t("edit.accountSettingsDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/account">{t("edit.manageAccount")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
