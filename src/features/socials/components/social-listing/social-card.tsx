"use client"

import { format } from "date-fns"
import { Activity, Calendar, Check, Users } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { ListSocial as Social } from "@/features/socials/types/social"
import { TOURNAMENT_THEME } from "@/features/tournaments/styles/theme"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { getGenderPolicyLabel, getStatusClasses } from "../../utils"

interface SocialCardProps {
  social: Social
  onClick?: () => void
}

export default function SocialCard({ social, onClick }: SocialCardProps) {
  const { t } = useSocialsTranslation()

  const formatLabel = t(`labels.${social.format.toLowerCase()}`)
  const ageGroupLabel = t(`labels.${social.ageGroup.toLowerCase()}`)
  const genderPolicyLabel = getGenderPolicyLabel(social, t)

  return (
    <Card
      key={social.id}
      className={`group flex h-full cursor-pointer flex-col gap-0 p-0 transition-all duration-300 hover:-translate-y-1 ${TOURNAMENT_THEME.card.base}`}
      onClick={onClick}
    >
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-linear-to-br from-sky-500 via-blue-600 to-violet-600">
        <Image
          src="/pickleball.png"
          alt={t("hero.imageAlt")}
          width={72}
          height={72}
          className="drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
        />

        {social.isHost && (
          <Badge
            className={`absolute top-3 left-3 border-sky-200 bg-sky-50 font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-300`}
          >
            {t("badges.hosting")}
          </Badge>
        )}
        {social.isParticipant && !social.isHost && (
          <Badge
            className={`absolute top-3 left-3 gap-1 ${TOURNAMENT_THEME.badge.success}`}
          >
            <Check className="size-3.5" />
            {t("badges.joined")}
          </Badge>
        )}
      </div>

      <CardHeader className="space-y-0 pt-6 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h2
            className={`line-clamp-1 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary dark:group-hover:text-emerald-400`}
          >
            {social.title}
          </h2>
          <Badge className={getStatusClasses(social.status)} variant="outline">
            {t(`labels.${social.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0 pb-6">
        <p className="mb-4 line-clamp-1 text-sm/relaxed text-muted-foreground">
          {social.note}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">{formatLabel}</Badge>
          {social.genderPolicy !== "ANY" && (
            <Badge variant="outline">{genderPolicyLabel}</Badge>
          )}
          {social.ageGroup !== "ANY" && (
            <Badge variant="outline">{ageGroupLabel}</Badge>
          )}
          {social.isFree && (
            <Badge
              variant="default"
              className={`${TOURNAMENT_THEME.badge.success} hover:bg-emerald-100 dark:hover:bg-emerald-900/60`}
            >
              {t("listing.free")}
            </Badge>
          )}
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-blue-500 dark:text-blue-400" />
            <span>
              {format(new Date(social.startTime), "dd/MM/yyyy HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-purple-500 dark:text-purple-400" />
            <span>
              {t("listing.sessionCount", { count: social._count.playSessions })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-emerald-500 dark:text-emerald-400" />
            <span>
              {social.joinedCount} {t("listing.participants")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pt-0 pb-6">
        <Badge
          className={`w-full justify-center py-2 text-sm font-semibold ${
            social.hasAvailableSlots
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "border border-border bg-muted text-muted-foreground"
          }`}
          variant="outline"
        >
          {social.hasAvailableSlots
            ? t("sidebar.available")
            : t("sidebar.full")}
        </Badge>
      </CardFooter>
    </Card>
  )
}
