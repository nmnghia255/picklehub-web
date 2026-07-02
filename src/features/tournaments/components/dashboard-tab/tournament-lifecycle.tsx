"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import type { Tournament } from "../../types/tournament"

interface TournamentLifecycleProps {
  initialTournament?: Tournament
}

export function TournamentLifecycle({
  initialTournament,
}: TournamentLifecycleProps) {
  const { t, i18n } = useTournamentTranslation()
  const { tournament } = useTournamentDashboardStore()

  const activeTournament = tournament || initialTournament

  if (!activeTournament) return null

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

  return (
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
            date={formatDateWithYear(activeTournament.createdAt ?? null)}
          />
          <TimelineItem
            title={t("dashboard.lifecycle.openRegistration", {
              defaultValue: "Registration Opens",
            })}
            status={
              activeTournament.status === "open_registration"
                ? "open_registration"
                : activeTournament.status === "closed_registration" ||
                    activeTournament.status === "in_progress" ||
                    activeTournament.status === "completed"
                  ? "completed"
                  : "upcoming"
            }
            date={formatDateWithYear(activeTournament.registrationStartDate)}
          />
          <TimelineItem
            title={t("dashboard.lifecycle.closeRegistration", {
              defaultValue: "Registration Closes",
            })}
            status={
              activeTournament.status === "closed_registration"
                ? "completed"
                : activeTournament.status === "open_registration"
                  ? "active"
                  : activeTournament.status === "in_progress" ||
                      activeTournament.status === "completed"
                    ? "completed"
                    : "upcoming"
            }
            date={formatDateWithYear(activeTournament.registrationEndDate)}
          />
          <TimelineItem
            title={t("dashboard.lifecycle.startTournament", {
              defaultValue: "Tournament Starts",
            })}
            status={
              activeTournament.status === "in_progress"
                ? "active"
                : activeTournament.status === "completed"
                  ? "completed"
                  : "upcoming"
            }
            date={formatDateWithYear(activeTournament.startDate)}
          />
          <TimelineItem
            title={t("dashboard.lifecycle.finishTournament", {
              defaultValue: "Tournament Finishes",
            })}
            status={
              activeTournament.status === "completed"
                ? "completed"
                : activeTournament.status === "in_progress"
                  ? "active"
                  : "upcoming"
            }
            date={formatDateWithYear(activeTournament.endDate)}
          />
        </div>
      </CardContent>
    </Card>
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
