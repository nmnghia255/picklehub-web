"use client"

import { UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function EditProfileAccountCard({
  avatarUrl,
  displayName,
  email,
}: {
  avatarUrl?: string | null
  displayName: string
  email: string
}) {
  const { t } = useProfileTranslation()
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" />
          {t("edit.account")}
        </CardTitle>
        <CardDescription>{t("edit.accountDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border bg-muted/20 p-4">
          <Avatar className="size-14">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback>
              {initials || t("unnamedPlayer").charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{t("name")}</p>
          <p className="font-medium">{displayName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("email")}</p>
          <p className="font-medium">{email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
