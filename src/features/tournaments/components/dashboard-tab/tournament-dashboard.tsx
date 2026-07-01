"use client"

import { Calendar, DollarSign, MapPin, Trophy, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { getFinanceSummaryAction } from "../../actions/finance-actions"
import { getTournamentFixturesWithScheduleAction } from "../../actions/schedule-actions"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"

export interface TournamentDashboardProps {
  tournament: Tournament
  events: TournamentEvent[]
}

export function TournamentDashboard({
  tournament,
  events,
}: TournamentDashboardProps) {
  const { t, i18n } = useTournamentTranslation()
  const [matchesCount, setMatchesCount] = useState<number | null>(null)
  const [revenue, setRevenue] = useState<number | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [fixturesRes, financeRes] = await Promise.all([
          getTournamentFixturesWithScheduleAction(tournament.id),
          getFinanceSummaryAction(tournament.id.toString()),
        ])

        if (fixturesRes.success && fixturesRes.data) {
          setMatchesCount(fixturesRes.data.length)
        } else {
          setMatchesCount(0)
        }

        if (financeRes.success && financeRes.data) {
          setRevenue(financeRes.data.summary.totalIncome ?? 0)
        } else {
          setRevenue(0)
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error)
        setMatchesCount(0)
        setRevenue(0)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [tournament.id])

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

  const formatDateWithYear = (dateStr: string | null) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const statsList = [
    {
      label: t("public.stats.participants", { defaultValue: "Participants" }),
      value: tournament.registered,
      icon: Users,
    },
    {
      label: t("public.stats.events", { defaultValue: "Events" }),
      value: events.length,
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
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {tournament.banner ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={tournament.banner}
              alt={tournament.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute right-6 bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                {tournament.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-200 dark:text-zinc-300">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{tournament.venue}</span>
                <span className="text-gray-400 dark:text-zinc-500">•</span>
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {formatDateRange(tournament.startDate, tournament.endDate)}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight">
              {tournament.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-emerald-100">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{tournament.venue}</span>
              <span className="text-emerald-300">•</span>
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {formatDateRange(tournament.startDate, tournament.endDate)}
              </span>
            </p>
          </div>
        )}
        {tournament.description && (
          <div className="border-t border-gray-50 p-6 dark:border-zinc-800">
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-zinc-300">
              {tournament.description}
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
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.registrationProgress")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {t("dashboard.noEvents", {
                  defaultValue: "No events added to this tournament yet.",
                })}
              </p>
            ) : (
              events.map((event) => (
                <div key={event.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                      {event.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        {event.participants ?? 0}/{event.capacity}
                      </span>
                      {event.status === "full" && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {t("dashboard.full")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={
                      event.capacity > 0
                        ? ((event.participants ?? 0) / event.capacity) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tournament Lifecycle */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.tournamentLifecycle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineItem
                title={t("dashboard.lifecycle.created", {
                  defaultValue: "Tournament Created",
                })}
                status="completed"
                date={formatDateWithYear(tournament.createdAt ?? null)}
              />
              <TimelineItem
                title={t("dashboard.lifecycle.openRegistration", {
                  defaultValue: "Registration Opens",
                })}
                status={
                  tournament.status === "open_registration"
                    ? "open_registration"
                    : tournament.status === "closed_registration" ||
                        tournament.status === "in_progress" ||
                        tournament.status === "completed"
                      ? "completed"
                      : "upcoming"
                }
                date={formatDateWithYear(tournament.registrationStartDate)}
              />
              <TimelineItem
                title={t("dashboard.lifecycle.closeRegistration", {
                  defaultValue: "Registration Closes",
                })}
                status={
                  tournament.status === "closed_registration"
                    ? "completed"
                    : tournament.status === "open_registration"
                      ? "active"
                      : tournament.status === "in_progress" ||
                          tournament.status === "completed"
                        ? "completed"
                        : "upcoming"
                }
                date={formatDateWithYear(tournament.registrationEndDate)}
              />
              <TimelineItem
                title={t("dashboard.lifecycle.startTournament", {
                  defaultValue: "Tournament Starts",
                })}
                status={
                  tournament.status === "in_progress"
                    ? "active"
                    : tournament.status === "completed"
                      ? "completed"
                      : "upcoming"
                }
                date={formatDateWithYear(tournament.startDate)}
              />
              <TimelineItem
                title={t("dashboard.lifecycle.finishTournament", {
                  defaultValue: "Tournament Finishes",
                })}
                status={
                  tournament.status === "completed"
                    ? "completed"
                    : tournament.status === "in_progress"
                      ? "active"
                      : "upcoming"
                }
                date={formatDateWithYear(tournament.endDate)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TimelineItem({
  title,
  status,
  date,
}: {
  title: string
  status:
    | "completed"
    | "active"
    | "upcoming"
    | "open_registration"
    | "closed_registration"
  date: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-3 w-3 rounded-full border-2",
            status === "completed" || status === "closed_registration"
              ? "border-emerald-600 bg-emerald-600"
              : status === "active" || status === "open_registration"
                ? "animate-pulse border-yellow-500 bg-yellow-500"
                : "border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
          )}
        />
        <div className="mt-1 h-full w-px bg-gray-200 dark:bg-zinc-800" />
      </div>
      <div className="flex-1 pb-4">
        <div
          className={cn(
            "font-medium",
            status === "active" || status === "open_registration"
              ? "text-gray-900 dark:text-zinc-100"
              : "text-gray-700 dark:text-zinc-300"
          )}
        >
          {title}
        </div>
        {date && (
          <div className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {date}
          </div>
        )}
      </div>
    </div>
  )
}
