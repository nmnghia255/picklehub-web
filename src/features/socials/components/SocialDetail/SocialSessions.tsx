"use client"

import { differenceInHours, format } from "date-fns"
import { Activity, Edit, Plus, Users } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressBar from "@/features/socials/components/SocialListing/ProgressBar"
import type { PlaySession } from "@/features/socials/types"

import MatchCard from "./MatchCard"

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
    inProgress: Parameters<typeof MatchCard>[0]["match"][]
    scheduled: Parameters<typeof MatchCard>[0]["match"][]
    completed: Parameters<typeof MatchCard>[0]["match"][]
  }
  onCreateSession: () => void
  onEditSession: (session: PlaySession) => void
  onOpenSession: (sessionId: string) => void
}) {
  return (
    <>
      <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Play Sessions</h2>
            {isHost && (
              <Button size="sm" onClick={onCreateSession}>
                <Plus className="size-4" />
                Add Session
              </Button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No play sessions scheduled yet.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="p-0">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold">
                          {session.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(session.startTime), "h:mm a")} -{" "}
                          {format(new Date(session.endTime), "h:mm a")}
                          {" • "}
                          {differenceInHours(
                            new Date(session.endTime),
                            new Date(session.startTime)
                          )}{" "}
                          hours
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{session.status}</Badge>
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
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Participants</span>
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
                        ? "Full"
                        : "View Session Details"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Match Schedule</h2>
          <div className="space-y-4">
            {matchesByStatus.inProgress.length +
              matchesByStatus.scheduled.length +
              matchesByStatus.completed.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                <Activity className="mx-auto mb-3 size-10 text-muted-foreground" />
                No matches scheduled yet.
              </div>
            ) : (
              <>
                {matchesByStatus.inProgress.length > 0 && (
                  <SectionLabel tone="warning">IN PROGRESS</SectionLabel>
                )}
                {matchesByStatus.inProgress.map((match) => (
                  <MatchCard key={match.id} match={match} isHost={isHost} />
                ))}

                {matchesByStatus.scheduled.length > 0 && (
                  <SectionLabel tone="primary">SCHEDULED</SectionLabel>
                )}
                {matchesByStatus.scheduled.map((match) => (
                  <MatchCard key={match.id} match={match} isHost={isHost} />
                ))}

                {matchesByStatus.completed.length > 0 && (
                  <SectionLabel tone="success">COMPLETED</SectionLabel>
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
      </Card>
    </>
  )
}
