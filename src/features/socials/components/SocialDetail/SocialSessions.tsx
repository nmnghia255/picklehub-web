"use client"

import { differenceInHours, format } from "date-fns"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressBar from "@/features/socials/components/SocialListing/ProgressBar"
import type { PlaySession } from "@/features/socials/types"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

function getSessionStatusLabel(status: PlaySession["status"], t: (key: string) => string) {
  switch (status) {
    case "ACTIVE":
      return t("labels.scheduled")
    case "CANCELLED":
      return t("labels.cancelled")
    default:
      return status
  }
}

export default function SocialSessions({
  sessions,
  onOpenSession,
  isHost,
}: {
  sessions: PlaySession[]
  onOpenSession: (sessionId: string) => void
  isHost?: boolean
}) {
  const { t } = useSocialsTranslation()

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t("sessions.title")}</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              {t("sessions.noSessions")}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const duration = differenceInHours(
                  new Date(session.endTime),
                  new Date(session.startTime)
                )

                return (
                  <Card key={session.id} className="p-0">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {format(new Date(session.startTime), "h:mm a")} - {" "}
                            {format(new Date(session.endTime), "h:mm a")}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("common.hours", { count: duration })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getSessionStatusLabel(session.status, t)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("sessions.participants")}</span>
                          <span>{session.joinedCount}</span>
                        </div>
                        <ProgressBar value={100} />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onOpenSession(session.id)}
                      >
                        {t("sessions.viewDetails")}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
