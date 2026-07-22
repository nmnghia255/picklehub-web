"use client"

import { differenceInMinutes } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/features/auth/hooks/use-session"
import { joinPlaySessionAction } from "@/features/socials/actions/join-play-session"
import { leavePlaySessionAction } from "@/features/socials/actions/leave-play-session"
import usePlaySessionStore from "@/features/socials/stores/play-session-store"
import type {
  PlaySessionMatch,
  PlaySessionMatchTeamPlayer,
} from "@/features/socials/types/match"
import type {
  PlaySession,
  PlaySessionParticipant,
} from "@/features/socials/types/play-session"
import {
  canJoinPlaySession,
  canLeavePlaySession,
  isActiveSocialParticipantStatus,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import PlaySessionMatches from "./play-session-matches"
import PlaySessionOverview from "./play-session-overview"
import PlaySessionParticipants from "./play-session-participants"

interface PlaySessionDetailProps {
  initialSession: PlaySession | null
  initialParticipants: PlaySessionParticipant[]
  initialMatches?: PlaySessionMatch[]
}

export default function PlaySessionDetail({
  initialSession,
  initialParticipants,
  initialMatches = [],
}: PlaySessionDetailProps) {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const sessionData = useSession()
  const tabValue = usePlaySessionStore((s) => s.tabValue)
  const setTabValue = usePlaySessionStore((s) => s.setTabValue)

  const socialId = params.socialId as string | undefined
  const sessionId = params.playSessionId as string | undefined
  const session = initialSession
  const participants = initialParticipants.filter((p) =>
    isActiveSocialParticipantStatus(p.status)
  )
  const currentUserId = sessionData?.user?.id
  const isParticipant = participants.some(
    (p) =>
      p.userId === currentUserId && isActiveSocialParticipantStatus(p.status)
  )
  const canJoin = session
    ? canJoinPlaySession(
        session.status,
        session.joinedCount,
        session.maxSlot,
        isParticipant
      )
    : false
  const canLeave = session
    ? canLeavePlaySession(session.status, isParticipant)
    : false

  const matches = useMemo(() => {
    return initialMatches.map((m) => {
      const getPlayerInfo = (player: PlaySessionMatchTeamPlayer) => {
        let name = player.fullName
        let avatar = player.avatarUrl

        if (!name) {
          const p = participants.find(
            (part) => part.id === player.id || part.userId === player.id
          )
          if (p) {
            name = p.guestName || p.user?.name || t("common.unknownPlayer")
            avatar = p.user?.avatarUrl || null
          } else {
            name = t("common.unknownPlayer")
          }
        }

        return {
          id: player.id,
          name,
          avatar,
        }
      }

      const team1Player1 = m.teamA[0] ? getPlayerInfo(m.teamA[0]) : null
      const team1Player2 = m.teamA[1] ? getPlayerInfo(m.teamA[1]) : null
      const team2Player1 = m.teamB[0] ? getPlayerInfo(m.teamB[0]) : null
      const team2Player2 = m.teamB[1] ? getPlayerInfo(m.teamB[1]) : null

      return {
        id: m.id,
        playSessionId: m.playSessionId,
        courtNumber: m.court
          ? parseInt(m.court.name.replace(/\D/g, "")) || 0
          : 0,
        courtName: m.court?.name,
        status: m.status,
        startTime: m.startedAt || m.scheduledAt,
        endTime: m.finishedAt,
        startedAt: m.startedAt,
        scheduledAt: m.scheduledAt,
        team1: {
          player1: team1Player1,
          player2: team1Player2,
        },
        team2: {
          player1: team2Player1,
          player2: team2Player2,
        },
        score:
          m.winner ||
          (m.sets && m.sets.length > 0) ||
          m.scoreA > 0 ||
          m.scoreB > 0
            ? {
                team1Score: m.scoreA,
                team2Score: m.scoreB,
              }
            : undefined,
        sets: m.sets,
        winner: m.winner,
        refereeId: m.refereeId,
      }
    })
  }, [initialMatches, participants, t])

  if (!session) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("detail.notFoundDescription")}
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          {t("detail.backToSocials")}
        </Button>
      </div>
    )
  }

  const isHost = Boolean(session.isHost)
  const duration = differenceInMinutes(
    new Date(session.endTime),
    new Date(session.startTime)
  )

  const completedMatches = matches.filter(
    (m) => !!m.winner || (m.sets && m.sets.length > 0)
  )
  const inProgressMatches = matches.filter((m) => m.status === "LIVE")
  const scheduledMatches = matches.filter(
    (m) => !m.winner && (!m.sets || m.sets.length === 0) && !m.startedAt
  )

  const handleJoin = async () => {
    if (!socialId || !sessionId || !canJoin) return
    const toastId = toast.loading(t("sessions.joining"))
    const result = await joinPlaySessionAction(socialId, sessionId)

    if (result.success) {
      toast.success(t("sessions.joinSuccess"), { id: toastId })
      router.refresh()
      return
    }

    // Prefer the backend's specific reason (e.g. the DUPR rating-restriction
    // rejection) over the generic fallback, per the `message || t(fallback)`
    // convention used across this feature.
    toast.error(result.error || t("sessions.joinError"), { id: toastId })
  }

  const handleLeave = async () => {
    if (!socialId || !sessionId || !canLeave) return
    toast.promise(
      leavePlaySessionAction(socialId, sessionId).then(() => {
        router.refresh()
      }),
      {
        loading: t("sessions.leaving"),
        success: t("sessions.leaveSuccess"),
        error: (err: Error) => t("sessions.leaveError") || err.message,
      }
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">
            {session.title}
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("matches.creation.back")}
        </Button>
      </div>

      <div className="w-full">
        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-4 p-0">
              <div className="px-6 pt-4">
                <div className="inline-flex rounded-lg border border-border bg-background p-1 text-sm font-medium">
                  <button
                    className={`rounded-md px-3 py-1.5 transition-colors ${tabValue === "0" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTabValue("0")}
                  >
                    {t("detail.overview")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 transition-colors ${tabValue === "1" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTabValue("1")}
                  >
                    {t("detail.participants")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 transition-colors ${tabValue === "2" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setTabValue("2")}
                  >
                    {t("matches.title")}
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                {tabValue === "0" && (
                  <PlaySessionOverview
                    session={session}
                    participants={participants}
                    duration={duration}
                    matches={matches}
                    isHost={isHost}
                    socialId={socialId}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                )}

                {tabValue === "1" && (
                  <PlaySessionParticipants participants={participants} />
                )}

                {tabValue === "2" && (
                  <PlaySessionMatches
                    isHost={isHost}
                    matches={{
                      inProgress: inProgressMatches,
                      scheduled: scheduledMatches,
                      completed: completedMatches,
                    }}
                    onCreateMatch={() =>
                      router.push(
                        `/socials/${socialId}/play-session/${sessionId}/create-matches`
                      )
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
