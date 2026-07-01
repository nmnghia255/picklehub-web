"use client"

import { Calendar, Clock, MapPin } from "lucide-react"

import { BackButton } from "@/components/common/back-button"
import { Badge } from "@/components/ui/badge"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Tournament } from "../../types/tournament"

function formatDateRange(startDateStr?: string, endDateStr?: string) {
  if (!startDateStr) return ""
  try {
    const start = new Date(startDateStr)
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    }
    const startFormatted = start.toLocaleDateString("vi-VN", options)

    if (endDateStr && endDateStr !== startDateStr) {
      const end = new Date(endDateStr)
      const endFormatted = end.toLocaleDateString("vi-VN", {
        month: start.getMonth() === end.getMonth() ? undefined : "short",
        day: "numeric",
        year: "numeric",
      })
      return `${startFormatted} - ${endFormatted}`
    }
    return `${startFormatted}, ${start.getFullYear()}`
  } catch {
    return `${startDateStr} - ${endDateStr || ""}`
  }
}

interface TournamentHeroProps {
  tournament?: Tournament
}

export function TournamentHero({ tournament }: TournamentHeroProps) {
  const { t } = useTournamentTranslation()

  const dateRange = tournament
    ? formatDateRange(tournament.startDate, tournament.endDate)
    : t("public.hero.dates")

  return (
    <div className="relative h-96 overflow-hidden bg-linear-to-r from-emerald-700 via-emerald-800 to-emerald-900 shadow-inner">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute top-4 right-4 z-1 md:top-6 md:right-8">
        <BackButton
          variant="outline"
          className="border-white/20 bg-white/5 font-semibold text-white backdrop-blur-xs transition-all duration-200 hover:bg-white/15 hover:text-white"
        />
      </div>
      <img
        src={
          tournament?.banner ||
          "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80"
        }
        alt={tournament?.name || "Tournament"}
        className="h-full w-full object-cover opacity-20 transition-transform duration-700 hover:scale-105"
      />
      <div className="relative flex h-full items-center justify-center px-4 text-center">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
            {tournament?.name || t("public.hero.title")}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-base font-medium text-white/90 md:text-lg">
            <div className="flex items-center gap-2 drop-shadow">
              <MapPin className="h-5 w-5 text-emerald-400" />
              {tournament?.venue || t("public.hero.location")}
            </div>
            <div className="flex items-center gap-2 drop-shadow">
              <Calendar className="h-5 w-5 text-emerald-400" />
              {dateRange}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Badge className="border-none bg-yellow-500 px-5 py-2 text-sm font-bold text-yellow-950 shadow-md transition-all duration-300 hover:bg-yellow-600 md:text-base">
              <Clock className="animate-spin-slow mr-2 h-4 w-4" />
              {tournament
                ? t(`list.statuses.${tournament.status}`)
                : t("public.hero.inProgress")}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
