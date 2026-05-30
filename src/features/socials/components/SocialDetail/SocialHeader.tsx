"use client"

import { Check, Edit, Share2, Trophy, Users } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SocialFormat, SocialStatus } from "@/features/socials/types"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

function getStatusClasses(status: SocialStatus) {
  switch (status) {
    case "PUBLISHED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function getFormatIcon(formatType: SocialFormat) {
  switch (formatType) {
    case "SINGLES":
      return <Users className="size-4" />
    default:
      return <Users className="size-4" />
  }
}

export default function SocialHeader({
  title,
  status,
  format,
  isHost,
  isParticipant,
  onShare,
  onEdit,
}: {
  title: string
  status: SocialStatus
  format: SocialFormat
  isHost: boolean
  isParticipant?: boolean
  onShare: () => void
  onEdit: () => void
}) {
  const { t } = useSocialsTranslation()

  const getStatusLabel = () => {
    switch (status) {
      case "PUBLISHED":
        return t("labels.published")
      case "COMPLETED":
        return t("labels.completed")
      case "CANCELLED":
        return t("labels.cancelled")
      default:
        return t("labels.draft")
    }
  }

  const getFormatLabel = () => {
    switch (format) {
      case "SINGLES":
        return t("labels.singles")
      default:
        return t("labels.social")
    }
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusClasses(status)} variant="outline">
                {getStatusLabel()}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {getFormatIcon(format)}
                {getFormatLabel()}
              </Badge>
              {isHost && <Badge>{t("badges.hosting")}</Badge>}
              {isParticipant && !isHost && (
                <Badge
                  className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                  variant="outline"
                >
                  <Check className="size-3.5" />
                  {t("badges.joined")}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onShare}>
              <Share2 className="size-4" />
            </Button>
            {isHost && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
