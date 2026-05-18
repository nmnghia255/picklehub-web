"use client"

import { differenceInHours, format } from "date-fns"
import { Edit, Plus } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressBar from "@/features/socials/components/SocialListing/ProgressBar"
import type { PlaySession } from "@/features/socials/types"

export default function PlaySessions({
  isHost,
  sessions,
  onCreateSession,
  onEditSession,
  onOpenSession,
}: {
  isHost: boolean
  sessions: PlaySession[]
  onCreateSession: () => void
  onEditSession: (session: PlaySession) => void
  onOpenSession: (sessionId: string) => void
}) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "outline"
      case "Ongoing":
        return "default"
      case "Completed":
        return "secondary"
      case "Cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
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
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
                onClick={() => onOpenSession(session.id)}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{session.title}</h3>
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
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status}
                    </Badge>
                    {isHost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditSession(session)
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
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
                  className="mt-3 w-full"
                  disabled={session.joinedCount >= session.maxSlots}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenSession(session.id)
                  }}
                >
                  {session.joinedCount >= session.maxSlots
                    ? "Full"
                    : "View Session Details"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
