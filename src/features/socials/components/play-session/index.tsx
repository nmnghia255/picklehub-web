"use client"

import { differenceInMinutes } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockSocials } from "@/features/socials/mockData"
import { getSessionWithDetails } from "@/features/socials/mockSessionData"
import usePlaySessionStore from "@/features/socials/stores/play-session-store"
import type { Match } from "@/features/socials/types"

import CreateMatchDialog from "./CreateMatchDialog"
import PlaySessionMatches from "./PlaySessionMatches"
import PlaySessionOverview from "./PlaySessionOverview"
import PlaySessionParticipants from "./PlaySessionParticipants"
import PlaySessionSidebar from "./PlaySessionSidebar"

function getSessionStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
    case "SCHEDULED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    case "IN_PROGRESS":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export default function PlaySessionDetail() {
  const params = useParams()
  const router = useRouter()
  const tabValue = usePlaySessionStore((s) => s.tabValue)
  const setTabValue = usePlaySessionStore((s) => s.setTabValue)
  const matchDialogOpen = usePlaySessionStore((s) => s.matchDialogOpen)
  const setMatchDialogOpen = usePlaySessionStore((s) => s.setMatchDialogOpen)

  const socialId = params.socialId as string | undefined
  const sessionId = params.playSessionId as string | undefined
  const social = mockSocials.find((item) => item.id === socialId)
  const session = sessionId
    ? getSessionWithDetails(sessionId, socialId || "")
    : undefined

  if (!social || !session) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Play session not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The session could not be found in this social.
        </p>
        <Button className="mt-6" onClick={() => router.push("/socials")}>
          Back to Socials
        </Button>
      </div>
    )
  }

  const isHost = Boolean(social.isHost)
  const duration = differenceInMinutes(
    new Date(session.endTime),
    new Date(session.startTime)
  )
  const completedMatches: Match[] =
    (session.matches?.filter(
      (match: Match) => match.status === "COMPLETED"
    ) as Match[]) || []
  const inProgressMatches: Match[] =
    (session.matches?.filter(
      (match: Match) => match.status === "IN_PROGRESS"
    ) as Match[]) || []
  const scheduledMatches: Match[] =
    (session.matches?.filter(
      (match: Match) => match.status === "SCHEDULED"
    ) as Match[]) || []

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/socials/${socialId}`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">
            {session.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{social.title}</p>
        </div>
        <Badge
          className={getSessionStatusClasses(session.status)}
          variant="outline"
        >
          {session.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-4 p-0">
              <div className="px-6 pt-4">
                <div className="inline-flex rounded-lg border border-border bg-background p-1 text-sm">
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "0" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("0")}
                  >
                    Overview
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "1" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("1")}
                  >
                    Matches ({session.matches?.length || 0})
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 ${tabValue === "2" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    onClick={() => setTabValue("2")}
                  >
                    Participants ({session.participants?.length || 0})
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                {tabValue === "0" && (
                  <PlaySessionOverview
                    session={session}
                    duration={duration}
                    completedMatchesCount={completedMatches.length}
                    activeMatchesCount={inProgressMatches.length}
                    upcomingMatchesCount={scheduledMatches.length}
                  />
                )}

                {tabValue === "1" && (
                  <PlaySessionMatches
                    isHost={isHost}
                    matches={{
                      inProgress: inProgressMatches,
                      scheduled: scheduledMatches,
                      completed: completedMatches,
                    }}
                    onCreateMatch={() => setMatchDialogOpen(true)}
                  />
                )}

                {tabValue === "2" && (
                  <PlaySessionParticipants
                    participants={session.participants}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <PlaySessionSidebar
          session={session}
          social={social}
          onJoin={() => alert("Join social")}
          onLeave={() => alert("Leave social")}
        />
      </div>

      <CreateMatchDialog
        open={matchDialogOpen}
        onOpenChange={setMatchDialogOpen}
      />
    </div>
  )
}
