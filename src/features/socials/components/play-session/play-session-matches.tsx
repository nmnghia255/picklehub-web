"use client"

import type { TFunction } from "i18next"
import {
  Activity,
  CheckCircle2,
  Loader2,
  Play,
  Plus,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { startPlaySession } from "@/features/socials/actions/play-session"
import {
  finishRoundAction,
  listRoundsAction,
  startRoundAction,
} from "@/features/socials/actions/round-actions"
import type {
  MatchParticipant,
  PlaySessionCardMatch,
  PlaySessionRound,
} from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import MatchCard from "./match-card"

type MatchItem = PlaySessionCardMatch & {
  roundNumber?: number
}

export function isPlaySessionStarted({
  sessionStatus,
  rounds,
  matches,
}: {
  sessionStatus?: string | null
  rounds: PlaySessionRound[]
  matches: MatchItem[]
}) {
  if (sessionStatus === "IN_PROGRESS" || sessionStatus === "COMPLETED") {
    return true
  }

  if (
    rounds.some(
      (round) => round.status === "IN_PROGRESS" || round.status === "COMPLETED"
    )
  ) {
    return true
  }

  return matches.some(
    (match) =>
      match.status === "LIVE" ||
      match.status === "IN_PROGRESS" ||
      !!match.startedAt ||
      match.status === "CONFIRMED"
  )
}

function normalizeMatchItem(
  rawMatch: unknown,
  matchIndexInRound?: number,
  waitingParticipants?: MatchParticipant[],
  tFn?: TFunction<"socials">
): MatchItem {
  if (!rawMatch || typeof rawMatch !== "object") return rawMatch as MatchItem
  const matchObj = rawMatch as Record<string, unknown>

  const pMap = new Map<
    string,
    {
      fullName: string
      avatarUrl: string | null
      gender?: string
      selfRating?: number | null
      duprRating?: number | null
    }
  >()
  if (Array.isArray(waitingParticipants)) {
    waitingParticipants.forEach((wp: unknown) => {
      const pItem = wp as Record<string, unknown> & {
        user?: {
          fullName?: string
          name?: string
          avatarUrl?: string
          gender?: string
          selfRating?: number | null
          dupr?: {
            rating?: number | null
          } | null
        }
        selfRating?: number | null
        duprRating?: number | null
        dupr?: {
          rating?: number | null
        } | null
      }
      const duprRating =
        (pItem.duprRating as number | null) ??
        (pItem.user?.dupr?.rating as number | null) ??
        ((pItem.dupr as { rating?: number | null } | null)?.rating as
          | number
          | null) ??
        null

      const info = {
        fullName:
          pItem.user?.fullName ||
          pItem.user?.name ||
          (pItem.fullName as string) ||
          (pItem.name as string) ||
          "Player",
        avatarUrl: pItem.user?.avatarUrl || (pItem.avatarUrl as string) || null,
        gender: pItem.user?.gender || (pItem.gender as string),
        selfRating:
          (pItem.selfRating as number | null) ?? pItem.user?.selfRating ?? null,
        duprRating,
      }
      if (pItem.participantId) pMap.set(pItem.participantId as string, info)
      if (pItem.userId) pMap.set(pItem.userId as string, info)
      if (pItem.id) pMap.set(pItem.id as string, info)
    })
  }

  const rawTeamA = Array.isArray(matchObj.teamA) ? matchObj.teamA : []
  const rawTeamB = Array.isArray(matchObj.teamB) ? matchObj.teamB : []

  const parsePlayerObj = (p: unknown) => {
    if (!p) return undefined
    if (typeof p === "string") {
      const found = pMap.get(p)
      return {
        id: p,
        name: found?.fullName || "Player",
        avatarUrl: found?.avatarUrl || null,
        gender: found?.gender,
      }
    }
    const playerObj = p as Record<string, unknown> & {
      user?: {
        fullName?: string
        name?: string
        avatarUrl?: string
        gender?: string
        selfRating?: number | null
        dupr?: {
          rating?: number | null
        } | null
      }
      selfRating?: number | null
      duprRating?: number | null
      dupr?: {
        rating?: number | null
      } | null
    }
    const pId = (playerObj.id ||
      playerObj.participantId ||
      playerObj.userId ||
      "") as string
    const found = pMap.get(pId)
    const selfRating =
      (playerObj.selfRating as number | null) ??
      playerObj.user?.selfRating ??
      found?.selfRating ??
      null
    const duprRating =
      (playerObj.duprRating as number | null) ??
      (playerObj.user?.dupr?.rating as number | null) ??
      ((playerObj.dupr as { rating?: number | null } | null)?.rating as
        | number
        | null) ??
      found?.duprRating ??
      null

    return {
      id: pId,
      name:
        (playerObj.name as string) ||
        (playerObj.fullName as string) ||
        playerObj.user?.fullName ||
        playerObj.user?.name ||
        found?.fullName ||
        "Player",
      avatar:
        (playerObj.avatar as string) ||
        (playerObj.avatarUrl as string) ||
        playerObj.user?.avatarUrl ||
        found?.avatarUrl ||
        null,
      avatarUrl:
        (playerObj.avatarUrl as string) ||
        (playerObj.avatar as string) ||
        playerObj.user?.avatarUrl ||
        found?.avatarUrl ||
        null,
      gender:
        (playerObj.gender as string) || playerObj.user?.gender || found?.gender,
      selfRating,
      duprRating,
    }
  }

  const team1Players = rawTeamA.map(parsePlayerObj).filter(Boolean)
  const team2Players = rawTeamB.map(parsePlayerObj).filter(Boolean)

  const court = matchObj.court as { name?: string } | undefined

  const resolvedCourtName =
    court?.name ??
    (matchObj.courtName as string) ??
    (matchObj.courtNumber ? `Sân ${matchObj.courtNumber}` : "Sân thi đấu")

  const matchLabel =
    (matchObj.matchLabel as string) ||
    (matchIndexInRound
      ? tFn
        ? tFn("matches.matchTitle", { match: matchIndexInRound })
        : `Trận ${matchIndexInRound}`
      : undefined)

  if (matchObj.team1 || matchObj.team2) {
    return {
      ...(matchObj as unknown as MatchItem),
      matchLabel: (matchObj.matchLabel as string) || matchLabel,
      courtName: (matchObj.courtName as string) || resolvedCourtName,
    }
  }

  const startTime = ((matchObj.startedAt as string | null) ||
    (matchObj.startTime as string | null) ||
    (matchObj.scheduledAt as string | null) ||
    null) as string | null

  const endTime = ((matchObj.finishedAt as string | null) ||
    (matchObj.completedAt as string | null) ||
    (matchObj.endTime as string | null) ||
    null) as string | null

  return {
    id: (matchObj.id as string) || `match-${Math.random()}`,
    roundNumber: matchObj.roundNumber as number | undefined,
    matchLabel,
    courtName: resolvedCourtName,
    status: (matchObj.status as string) || undefined,
    startTime,
    endTime,
    startedAt: (matchObj.startedAt as string) || null,
    scheduledAt: (matchObj.scheduledAt as string) || null,
    completedAt: (matchObj.completedAt as string) || null,
    refereeId: (matchObj.refereeId as string) || null,
    winner: matchObj.winner,
    score:
      matchObj.score ||
      (matchObj.scoreA !== undefined && matchObj.scoreB !== undefined
        ? { team1Score: matchObj.scoreA, team2Score: matchObj.scoreB }
        : undefined),
    team1: {
      player1: team1Players[0],
      player2: team1Players[1],
    },
    team2: {
      player1: team2Players[0],
      player2: team2Players[1],
    },
  } as unknown as MatchItem
}

export default function PlaySessionMatches({
  socialId,
  sessionId,
  isHost,
  sessionStatus,
  matches = [],
  onCreateMatch,
}: {
  socialId?: string
  sessionId?: string
  isHost: boolean
  sessionStatus?: string | null
  matches: MatchItem[]
  onCreateMatch: () => void
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()

  const [rounds, setRounds] = useState<PlaySessionRound[]>([])

  const [isLoadingRounds, setIsLoadingRounds] = useState(() =>
    Boolean(socialId && sessionId)
  )
  const [isStartingSession, setIsStartingSession] = useState(false)

  const sessionStarted = useMemo(() => {
    return isPlaySessionStarted({
      sessionStatus,
      rounds,
      matches,
    })
  }, [matches, rounds, sessionStatus])

  const [executingRoundId, setExecutingRoundId] = useState<string | null>(null)

  const fetchRounds = React.useCallback(async () => {
    if (!socialId || !sessionId) return
    const data = await listRoundsAction(socialId, sessionId)
    setRounds(data || [])
  }, [socialId, sessionId])

  useEffect(() => {
    if (!socialId || !sessionId) return

    let isMounted = true
    listRoundsAction(socialId, sessionId)
      .then((data) => {
        if (isMounted) setRounds(data || [])
      })
      .finally(() => {
        if (isMounted) setIsLoadingRounds(false)
      })

    return () => {
      isMounted = false
    }
  }, [socialId, sessionId])

  const handleStartRound = async (roundId: string, roundNumber: number) => {
    if (!socialId || !sessionId) return
    setExecutingRoundId(roundId)
    try {
      await startRoundAction(socialId, sessionId, roundId)
      toast.success(t("matches.startRound", { round: roundNumber }))
      await fetchRounds()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.actionFailed"))
    } finally {
      setExecutingRoundId(null)
    }
  }

  const handleFinishRound = async (roundId: string, roundNumber: number) => {
    if (!socialId || !sessionId) return
    setExecutingRoundId(roundId)
    try {
      await finishRoundAction(socialId, sessionId, roundId)
      toast.success(t("matches.finishRound", { round: roundNumber }))
      await fetchRounds()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.actionFailed"))
    } finally {
      setExecutingRoundId(null)
    }
  }

  const handleStartSession = async () => {
    if (!socialId || !sessionId) return

    setIsStartingSession(true)
    try {
      await startPlaySession(socialId, sessionId)
      toast.success(t("sessions.startSuccess"))
      await fetchRounds()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.actionFailed"))
    } finally {
      setIsStartingSession(false)
    }
  }

  // Filter out empty rounds that do not have any matches or waiting participants
  const validRounds = useMemo(() => {
    const rawRounds: PlaySessionRound[] =
      rounds.length > 0
        ? rounds
        : matches.length > 0
          ? [
              {
                id: "fallback-round-1",
                roundNumber: 1,
                status: "IN_PROGRESS" as const,
                scheduledAt: new Date().toISOString(),
                matches: matches as unknown as PlaySessionRound["matches"],
                waitingParticipants: [],
              },
            ]
          : []

    return rawRounds.filter((round) => {
      const rNum = round.roundNumber || 1
      const roundMatches =
        round.matches && round.matches.length > 0
          ? round.matches
          : matches.filter((m) => (m.roundNumber || 1) === rNum)
      const hasMatches = roundMatches && roundMatches.length > 0
      const hasWaiting =
        round.waitingParticipants && round.waitingParticipants.length > 0
      return (
        hasMatches ||
        hasWaiting ||
        Boolean(
          (round as unknown as Record<string, number>).createdMatchesCount
        )
      )
    })
  }, [rounds, matches])

  return (
    <div className="space-y-6">
      {/* Header bar: Title on left, [+ Tạo trận] on right */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {t("matches.title")}
        </h3>
        {isHost && (
          <div className="flex items-center gap-2">
            {!sessionStarted && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartSession}
                disabled={isStartingSession || isLoadingRounds}
                className="gap-2"
              >
                {isStartingSession ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                {t("sessions.startSession")}
              </Button>
            )}
            <Button
              size="sm"
              onClick={onCreateMatch}
              disabled={!sessionStarted}
              className="gap-2 bg-emerald-600 font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-4" />
              {t("matches.createMatch")}
            </Button>
          </div>
        )}
      </div>

      {/* Grouped Round List (Vòng 1, Vòng 2, Vòng 3...) */}
      <div className="space-y-6">
        {validRounds.length === 0 && !isLoadingRounds ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            <Activity className="mx-auto mb-3 size-10 text-muted-foreground" />
            {t("matches.noMatches")}
          </div>
        ) : (
          validRounds.map((round: PlaySessionRound) => {
            const rNum = round.roundNumber || 1
            const rStatus = round.status || "SCHEDULED"
            const rawRoundMatches =
              round.matches && round.matches.length > 0
                ? round.matches
                : matches.filter((m) => (m.roundNumber || 1) === rNum)

            return (
              <div
                key={round.id || rNum}
                className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Round Block Header */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold tracking-wide text-foreground uppercase">
                      {t("matches.roundTitle", { round: rNum })}
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      —
                    </span>
                    <Badge
                      variant={
                        rStatus === "IN_PROGRESS" ? "default" : "outline"
                      }
                      className={
                        rStatus === "IN_PROGRESS"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : rStatus === "SCHEDULED"
                            ? "border-sky-500 text-sky-600"
                            : "border-emerald-500 text-emerald-600"
                      }
                    >
                      {rStatus === "IN_PROGRESS"
                        ? t("matches.statusInProgress")
                        : rStatus === "SCHEDULED"
                          ? t("matches.statusScheduled")
                          : t("matches.statusCompleted")}
                    </Badge>
                  </div>
                </div>

                {/* Round Matches */}
                <div className="space-y-4 pt-1">
                  {rawRoundMatches.map(
                    (rawMatch: unknown, matchIdx: number) => {
                      const normalizedMatch = normalizeMatchItem(
                        rawMatch,
                        matchIdx + 1,
                        round.waitingParticipants,
                        t
                      )
                      return (
                        <MatchCard
                          key={normalizedMatch.id}
                          match={normalizedMatch}
                          isHost={isHost}
                          completed={rStatus === "COMPLETED"}
                          isRoundStarted={
                            rStatus === "IN_PROGRESS" || rStatus === "COMPLETED"
                          }
                          onResultSuccess={fetchRounds}
                        />
                      )
                    }
                  )}
                </div>

                {/* Round Waiting/Resting List (Danh Sách Nghỉ Vòng Này) */}
                {round.waitingParticipants &&
                  round.waitingParticipants.length > 0 && (
                    <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Users className="size-4 text-primary" />
                        <span>{t("matches.restingBenchTitle")}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                          {round.waitingParticipants.length}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {round.waitingParticipants.map(
                          (wp: MatchParticipant) => (
                            <div
                              key={wp.participantId || wp.userId}
                              className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-2xs"
                            >
                              <Avatar className="size-5">
                                <AvatarImage
                                  src={wp.user?.avatarUrl || undefined}
                                />
                                <AvatarFallback className="text-[9px]">
                                  {(wp.user?.fullName || "P")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">
                                {wp.user?.fullName || t("common.unknownPlayer")}
                              </span>
                              {wp.user?.selfRating && (
                                <span className="text-[10px] text-muted-foreground">
                                  ({wp.user.selfRating})
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Round Action Buttons: Bắt đầu / Kết thúc vòng */}
                {isHost && (
                  <div className="flex justify-end border-t pt-3">
                    {rStatus === "SCHEDULED" && (
                      <Button
                        size="sm"
                        className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => handleStartRound(round.id, rNum)}
                        disabled={
                          executingRoundId === round.id || isLoadingRounds
                        }
                      >
                        {executingRoundId === round.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Play className="size-4" />
                        )}
                        {t("matches.startRound", { round: rNum })}
                      </Button>
                    )}

                    {rStatus === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-500/50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                        onClick={() => handleFinishRound(round.id, rNum)}
                        disabled={
                          executingRoundId === round.id || isLoadingRounds
                        }
                      >
                        {executingRoundId === round.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4 text-amber-600 dark:text-amber-400" />
                        )}
                        {t("matches.finishRound", { round: rNum })}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
