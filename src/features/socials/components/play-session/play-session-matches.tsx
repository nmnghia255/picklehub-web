"use client"

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
import {
  finishRoundAction,
  listRoundsAction,
  startRoundAction,
} from "@/features/socials/actions/round-actions"
import type {
  MatchParticipant,
  PlaySessionRound,
} from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import MatchCard from "./match-card"

type MatchItem = Parameters<typeof MatchCard>[0]["match"] & {
  roundNumber?: number
}

function normalizeMatchItem(
  rawMatch: unknown,
  matchIndexInRound?: number,
  waitingParticipants?: MatchParticipant[],
  tFn?: (key: string, options?: unknown) => string
): MatchItem {
  if (!rawMatch || typeof rawMatch !== "object") return rawMatch as MatchItem
  const matchObj = rawMatch as Record<string, unknown>

  const pMap = new Map<
    string,
    { fullName: string; avatarUrl: string | null; gender?: string }
  >()
  if (Array.isArray(waitingParticipants)) {
    waitingParticipants.forEach((wp: unknown) => {
      const pItem = wp as Record<string, unknown> & {
        user?: {
          fullName?: string
          name?: string
          avatarUrl?: string
          gender?: string
        }
      }
      const info = {
        fullName:
          pItem.user?.fullName ||
          pItem.user?.name ||
          (pItem.fullName as string) ||
          (pItem.name as string) ||
          "Player",
        avatarUrl: pItem.user?.avatarUrl || (pItem.avatarUrl as string) || null,
        gender: pItem.user?.gender || (pItem.gender as string),
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
      }
    }
    const pId = (playerObj.id ||
      playerObj.participantId ||
      playerObj.userId ||
      "") as string
    const found = pMap.get(pId)

    return {
      id: pId,
      name:
        (playerObj.name as string) ||
        (playerObj.fullName as string) ||
        playerObj.user?.fullName ||
        playerObj.user?.name ||
        found?.fullName ||
        "Player",
      avatarUrl:
        (playerObj.avatarUrl as string) ||
        playerObj.user?.avatarUrl ||
        found?.avatarUrl ||
        null,
      gender:
        (playerObj.gender as string) || playerObj.user?.gender || found?.gender,
    }
  }

  const team1Players = rawTeamA.map(parsePlayerObj).filter(Boolean)
  const team2Players = rawTeamB.map(parsePlayerObj).filter(Boolean)

  const resolvedCourtName =
    (matchObj.courtName as string) ||
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
      ...(matchObj as MatchItem),
      matchLabel: (matchObj.matchLabel as string) || matchLabel,
      courtName: (matchObj.courtName as string) || resolvedCourtName,
    }
  }

  return {
    id: (matchObj.id as string) || `match-${Math.random()}`,
    roundNumber: matchObj.roundNumber as number | undefined,
    matchLabel,
    courtName: resolvedCourtName,
    completedAt: rawMatch.completedAt,
    refereeId: rawMatch.refereeId || null,
    winner: rawMatch.winner,
    score:
      rawMatch.score ||
      (rawMatch.scoreA !== undefined && rawMatch.scoreB !== undefined
        ? { team1Score: rawMatch.scoreA, team2Score: rawMatch.scoreB }
        : undefined),
    team1: {
      player1: parsePlayerObj(rawTeamA[0]),
      player2: parsePlayerObj(rawTeamA[1]),
    },
    team2: {
      player1: parsePlayerObj(rawTeamB[0]),
      player2: parsePlayerObj(rawTeamB[1]),
    },
  } as unknown as MatchItem
}

export default function PlaySessionMatches({
  socialId,
  sessionId,
  isHost,
  matches = [],
  onCreateMatch,
}: {
  socialId?: string
  sessionId?: string
  isHost: boolean
  matches: MatchItem[]
  onCreateMatch: () => void
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()

  const [rounds, setRounds] = useState<PlaySessionRound[]>([])
  const [isLoadingRounds, setIsLoadingRounds] = useState(() =>
    Boolean(socialId && sessionId)
  )
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
          <Button
            size="sm"
            onClick={onCreateMatch}
            className="gap-2 bg-emerald-600 font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            {t("matches.createMatch")}
          </Button>
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
