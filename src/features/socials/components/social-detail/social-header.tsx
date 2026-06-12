"use client"

import { ArrowLeft, Check, Edit, Loader2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type {
  SocialFormat,
  SocialStatus,
} from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { getFormatLabel, getStatusClasses, getStatusLabel } from "../../utils"

export function getFormatIcon(formatType: SocialFormat) {
  switch (formatType) {
    case "SINGLES":
      return <Users className="size-4" />
    case "SOCIAL":
      return <Users className="size-4" />
    default:
      return <Users className="size-4" />
  }
}

interface SocialHeaderProps {
  title: string
  status: SocialStatus
  format: SocialFormat
  isHost: boolean
  isParticipant?: boolean
  onBack: () => void
  onEdit: () => void
  onComplete?: () => void
  isCompleting?: boolean
}

export default function SocialHeader({
  title,
  status,
  format,
  isHost,
  isParticipant,
  onBack,
  onEdit,
  onComplete,
  isCompleting = false,
}: SocialHeaderProps) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusClasses(status)} variant="outline">
                {getStatusLabel(status, t)}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {getFormatIcon(format)}
                {getFormatLabel(format, t)}
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

          <div className="flex items-center gap-1.5">
            {isHost && status === "PUBLISHED" && onComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={isCompleting}
                className="h-9 gap-1.5 border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                {isCompleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {t("form.completeSocial") || "Complete Social"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="size-4" />
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
