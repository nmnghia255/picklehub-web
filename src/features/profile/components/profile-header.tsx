"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function ProfileHeader({
  name,
  subtitle,
  avatarUrl,
  actionHref,
  actionLabel,
  subtitleFallbackKey,
}: {
  name: string
  subtitle: string
  avatarUrl?: string | null
  actionHref?: string
  actionLabel?: string
  subtitleFallbackKey?: "noEmail" | "noBio"
}) {
  const { t } = useProfileTranslation()
  const displayName = name || t("unnamedPlayer")
  const displaySubtitle =
    subtitle || (subtitleFallbackKey ? t(subtitleFallbackKey) : "")
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="size-20 shrink-0 ring-4 ring-background/80">
          <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-linear-to-br from-primary via-primary/90 to-primary/70 text-3xl font-semibold text-primary-foreground">
            {initials || t("unnamedPlayer").charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>

          <p className="text-muted-foreground">{displaySubtitle}</p>
        </div>
      </div>
      {actionHref ? (
        <Button asChild>
          <Link href={actionHref}>{actionLabel || t("editProfile")}</Link>
        </Button>
      ) : null}
    </div>
  )
}
