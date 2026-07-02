"use client"

import { Calendar, DollarSign, MapPin, Trophy, Users } from "lucide-react"
import { useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import type { TournamentPrize } from "../../types/prize"
import type { Sponsor } from "../../types/sponsor"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { RegistrationProgress } from "./registration-progress"
import { StatusControlPanel } from "./status-control-panel"
import { TournamentLifecycle } from "./tournament-lifecycle"

export interface TournamentDashboardProps {
  tournament: Tournament
  events: TournamentEvent[]
  prizes?: TournamentPrize[]
  sponsors?: Sponsor[]
  isHost?: boolean
}

export function TournamentDashboard({
  tournament: initialTournament,
  events: initialEvents,
  prizes = [],
  sponsors = [],
  isHost = false,
}: TournamentDashboardProps) {
  const { t, i18n } = useTournamentTranslation()
  const {
    tournament,
    events,
    matchesCount,
    revenue,
    loadingStats,
    setInitialData,
    fetchStats,
  } = useTournamentDashboardStore()

  useEffect(() => {
    setInitialData({
      tournament: initialTournament,
      events: initialEvents,
      prizes,
      sponsors,
      isHost,
    })
    fetchStats()
  }, [
    initialTournament,
    initialEvents,
    prizes,
    sponsors,
    isHost,
    setInitialData,
    fetchStats,
  ])

  // Use store data if available, fallback to initial props during hydration/first render
  const activeTournament = tournament || initialTournament
  const activeEvents = events.length > 0 ? events : initialEvents

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr)
      const end = new Date(endStr)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${startStr} - ${endStr}`
      }
      const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
      return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`
    } catch {
      return `${startStr} - ${endStr}`
    }
  }

  const formatCurrency = (amount: number) => {
    if (i18n.language === "vi") {
      return `${amount.toLocaleString("vi-VN")} VND`
    }
    return `$${amount.toLocaleString()}`
  }

  const statsList = [
    {
      label: t("public.stats.participants", { defaultValue: "Participants" }),
      value: activeTournament.registered,
      icon: Users,
    },
    {
      label: t("public.stats.events", { defaultValue: "Events" }),
      value: activeEvents.length,
      icon: Calendar,
    },
    {
      label: t("public.stats.totalMatches", { defaultValue: "Matches" }),
      value: loadingStats ? "..." : (matchesCount ?? 0),
      icon: Trophy,
    },
    {
      label: t("financials.summary.totalRevenue", { defaultValue: "Revenue" }),
      value: loadingStats ? "..." : formatCurrency(revenue ?? 0),
      icon: DollarSign,
    },
  ]

  return (
    <div className="h-full w-full max-w-7xl p-8">
      {/* Tournament Info Banner */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 [--color-white:#ffffff] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {activeTournament.banner ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={activeTournament.banner}
              alt={activeTournament.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                {activeTournament.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                <MapPin className="h-4 w-4 shrink-0 text-white/70" />
                <span>{activeTournament.venue}</span>
                <span className="text-white/40">•</span>
                <Calendar className="h-4 w-4 shrink-0 text-white/70" />
                <span>
                  {formatDateRange(
                    activeTournament.startDate,
                    activeTournament.endDate
                  )}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight">
              {activeTournament.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{activeTournament.venue}</span>
              <span className="text-emerald-300">•</span>
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {formatDateRange(
                  activeTournament.startDate,
                  activeTournament.endDate
                )}
              </span>
            </p>
          </div>
        )}
        {activeTournament.description && (
          <div className="border-t border-gray-50 p-6 dark:border-zinc-800">
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-zinc-300">
              {activeTournament.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsList.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  {Icon && (
                    <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="mb-1 text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Progress */}
        <RegistrationProgress initialEvents={initialEvents} />

        {/* Tournament Lifecycle */}
        <TournamentLifecycle initialTournament={initialTournament} />
      </div>

      {/* Host Status Actions Panel */}
      <StatusControlPanel />
    </div>
  )
}
