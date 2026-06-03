"use client"

import { differenceInHours, format } from "date-fns"
import { Edit, Plus, Users } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressBar from "@/features/socials/components/social-listing/ProgressBar"
import type { Match, PlaySession } from "@/features/socials/types"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

// import MatchCard from "./MatchCard"

/*
function SectionLabel({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "warning" | "primary" | "success"
}) {
  const classes =
    tone === "warning"
      ? "text-amber-600"
      : tone === "primary"
        ? "text-primary"
        : "text-emerald-600"

  return (
    <p className={`text-xs font-semibold tracking-[0.2em] ${classes}`}>
      {children}
    </p>
  )
}

function getMatchSectionLabel(
  status: Match["status"],
  t: (key: string) => string
) {
  switch (status) {
    case "IN_PROGRESS":
      return t("labels.inProgress")
    case "COMPLETED":
      return t("labels.completed")
    case "CANCELLED":
      return t("labels.cancelled")
    default:
      return t("labels.scheduled")
  }
}
*/

function getSessionStatusLabel(
  status: PlaySession["status"],
  t: (key: string) => string
) {
  switch (status) {
    case "PUBLISHED":
      return t("labels.published")
    case "COMPLETED":
      return t("labels.completed")
    case "CANCELLED":
      return t("labels.cancelled")
    case "DRAFT":
      return t("labels.draft")
    default:
      return t("labels.scheduled")
  }
}

export default function SocialSessions({
  isHost,
  sessions,
  matchesByStatus,
  onCreateSession,
  onEditSession,
  onOpenSession,
}: {
  isHost: boolean
  sessions: PlaySession[]
  matchesByStatus: {
    inProgress: Match[]
    scheduled: Match[]
    completed: Match[]
  }
  onCreateSession: () => void
  onEditSession: (session: PlaySession) => void
  onOpenSession: (sessionId: string) => void
}) {
  const { t } = useSocialsTranslation()

  /*
  const totalMatches =
    matchesByStatus.inProgress.length +
    matchesByStatus.scheduled.length +
    matchesByStatus.completed.length
  */

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t("sessions.title")}</h2>
            {isHost && (
              <Button size="sm" onClick={onCreateSession}>
                <Plus className="mr-2 size-4" />
                {t("sessions.addSession")}
              </Button>
            )}
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
                            {format(new Date(session.startTime), "h:mm a")} -{" "}
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
                        {isHost && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditSession(session)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onOpenSession(session.id)}
                            >
                              <Users className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("sessions.participants")}</span>
                          <span>
                            {session.joinedCount} / {session.maxSlots}
                          </span>
                        </div>
                        <ProgressBar
                          value={(session.joinedCount / session.maxSlots) * 100}
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={session.joinedCount >= session.maxSlots}
                        onClick={() => onOpenSession(session.id)}
                      >
                        {session.joinedCount >= session.maxSlots
                          ? t("sessions.full")
                          : t("sessions.viewDetails")}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">{t("matches.title")}</h2>
          <div className="space-y-4">
            {totalMatches === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                <Activity className="mx-auto mb-3 size-10 text-muted-foreground" />
                {t("matches.noMatches")}
              </div>
            ) : (
              <>
                {matchesByStatus.inProgress.length > 0 && (
                  <SectionLabel tone="warning">
                    {getMatchSectionLabel("IN_PROGRESS", t)}
                  </SectionLabel>
                )}
                {matchesByStatus.inProgress.map((match) => (
                  <MatchCard key={match.id} match={match} isHost={isHost} />
                ))}

                {matchesByStatus.scheduled.length > 0 && (
                  <SectionLabel tone="primary">
                    {getMatchSectionLabel("SCHEDULED", t)}
                  </SectionLabel>
                )}
                {matchesByStatus.scheduled.map((match) => (
                  <MatchCard key={match.id} match={match} isHost={isHost} />
                ))}

                {matchesByStatus.completed.length > 0 && (
                  <SectionLabel tone="success">
                    {getMatchSectionLabel("COMPLETED", t)}
                  </SectionLabel>
                )}
                {matchesByStatus.completed.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isHost={isHost}
                    completed
                  />
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
