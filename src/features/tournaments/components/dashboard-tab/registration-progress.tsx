"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import type { TournamentEvent } from "../../types/tournament-event"

interface RegistrationProgressProps {
  initialEvents?: TournamentEvent[]
}

export function RegistrationProgress({
  initialEvents = [],
}: RegistrationProgressProps) {
  const { t } = useTournamentTranslation()
  const { events } = useTournamentDashboardStore()

  const activeEvents = events.length > 0 ? events : initialEvents

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.registrationProgress")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {t("dashboard.noEvents", {
              defaultValue: "No events added to this tournament yet.",
            })}
          </p>
        ) : (
          activeEvents.map((event) => (
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
  )
}
