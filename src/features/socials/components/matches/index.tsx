"use client"

import {
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  commitRoundAction,
  completePlaySessionAction,
} from "@/features/socials/actions/round-actions"
import { suggestMatches } from "@/features/socials/actions/suggested-matches"
import { CompleteSessionDialog } from "@/features/socials/components/matches/complete-session-dialog"
import { MatchMatrix } from "@/features/socials/components/matches/match-matrix"
import { MatchesControlPanel } from "@/features/socials/components/matches/matches-control-panel"
import { RestingBenchSection } from "@/features/socials/components/matches/resting-bench-section"
import { StatisticCard } from "@/features/socials/components/matches/statistic-card"
import { useMatchesGeneratorStore } from "@/features/socials/stores/matches-generator-store"
import usePlaySessionStore from "@/features/socials/stores/play-session-store"
import type {
  CommitMatchRequest,
  Match,
  Player,
  SuggestedMatchRequest,
} from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

const isPlayer = (player: Player | null): player is Player => player !== null

function isMatchCompleteOrEmpty(match: Match): boolean {
  const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
  const activePlayers = match.players.filter(isPlayer).length
  return activePlayers === 0 || activePlayers === maxPlayers
}

interface MatchesCreationContentProps {
  initialPlayers: Player[]
  numberOfCourts?: number
  bookingIds?: string[]
  availableCourts?: Array<{ id: string; name: string }>
}

export function MatchesCreationContent({
  initialPlayers,
  numberOfCourts = 0,
  bookingIds,
  availableCourts,
}: MatchesCreationContentProps) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const params = useParams()
  const socialId = params.socialId as string
  const playSessionId = params.playSessionId as string

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [incompleteSessions, setIncompleteSessions] = useState<number[]>([])
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const handleConfirmCompleteSession = async () => {
    try {
      const res = await completePlaySessionAction(socialId, playSessionId)
      toast.success("Đã hoàn tất ca chơi!")
      return res
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thất bại khi kết thúc ca chơi"
      )
    }
  }

  const {
    courts,
    players,
    waitingParticipants,
    matches,
    setCourts,
    setMatches,
    setWaitingParticipants,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
    removeMatch,
    swapPlayers,
    setPlayers,
    scheduleTimes,
    setScheduleTimes,
  } = useMatchesGeneratorStore()

  useEffect(() => {
    setPlayers(initialPlayers)
    const timer = window.setTimeout(() => setIsInitialLoading(false), 450)
    return () => window.clearTimeout(timer)
  }, [initialPlayers, setPlayers])

  const handleGenerateMatches = async (request: SuggestedMatchRequest) => {
    try {
      const batch = await suggestMatches(socialId, playSessionId, request)

      const newMatches: Match[] = []
      let matchIdCounter = 1
      const newScheduleTimes: string[] = []
      const newWaiting: Player[] = []

      batch.rounds.forEach((round) => {
        newScheduleTimes[round.roundIndex] = round.scheduledAt

        const parsePlayer = (p: unknown): Player => {
          const item = (p || {}) as Record<string, unknown> & {
            id?: string
            participantId?: string
            userId?: string
            user?: {
              fullName?: string
              name?: string
              avatarUrl?: string
              avatar?: string
              selfRating?: number
              matchesPlayed?: number
              dupr?: { rating?: number }
            }
            fullName?: string
            name?: string
            avatarUrl?: string
            avatar?: string
            skillLevel?: number
            selfRating?: number
            matchesPlayed?: number
            duprRating?: number
          }
          const pId =
            item.participantId ||
            item.userId ||
            item.id ||
            `player-${Math.random()}`
          const matched = players.find((ap) => ap.id === pId)

          return {
            id: pId,
            name:
              item.user?.fullName ||
              item.user?.name ||
              item.fullName ||
              item.name ||
              matched?.name ||
              t("common.unknownPlayer"),
            avatarUrl:
              item.user?.avatarUrl ||
              item.avatarUrl ||
              matched?.avatarUrl ||
              null,
            skillLevel:
              item.user?.selfRating ?? item.selfRating ?? matched?.skillLevel,
            matchesPlayed:
              item.user?.matchesPlayed ??
              item.matchesPlayed ??
              matched?.matchesPlayed ??
              0,
            duprRating:
              item.user?.dupr?.rating ??
              item.duprRating ??
              matched?.duprRating ??
              null,
          }
        }

        if (round.waitingParticipants) {
          round.waitingParticipants.forEach((wp) => {
            newWaiting.push(parsePlayer(wp))
          })
        }

        round.matches.forEach((m) => {
          const matchPlayers: Array<Player | null> = []

          m.teamA.forEach((p) => {
            matchPlayers.push(parsePlayer(p))
          })

          m.teamB.forEach((p) => {
            matchPlayers.push(parsePlayer(p))
          })

          const requiredPlayers = m.matchType === "DOUBLES" ? 4 : 2
          while (matchPlayers.length < requiredPlayers) {
            matchPlayers.push(null)
          }

          newMatches.push({
            id: `suggested-match-${matchIdCounter++}`,
            courtId: m.courtId,
            sessionIndex: round.roundIndex,
            matchType: m.matchType,
            players: matchPlayers,
          })
        })
      })

      setCourts(request.courtIds?.length || numberOfCourts || 2)
      setMatches(newMatches)
      setWaitingParticipants(newWaiting)
      setScheduleTimes(newScheduleTimes)
      toast.success(t("matches.creation.generateSuccess"))
    } catch (error: unknown) {
      const message =
        (
          error as {
            response?: { data?: { message?: string | string[] } }
            data?: { message?: string | string[] }
          }
        )?.response?.data?.message ||
        (error as { data?: { message?: string | string[] } })?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        t("matches.creation.generateError")
      const finalMessage = Array.isArray(message) ? message.join(", ") : message
      toast.error(finalMessage || t("matches.controlPanel.generateError"))
      console.error(error)
    }
  }

  function validateMatchPlayers(
    match: Match,
    availableCourts?: Array<{ id: string; name: string }>,
    t?: (key: string, options?: Record<string, unknown>) => string
  ): string | null {
    const activePlayers = match.players.filter(isPlayer)
    if (activePlayers.length === 0) return null

    const courtName =
      availableCourts?.find((c) => c.id === match.courtId)?.name ||
      `Sân ${match.courtId.slice(0, 6)}`
    const reqTotal = match.matchType === "DOUBLES" ? 4 : 2

    if (activePlayers.length !== reqTotal) {
      return t
        ? t("matches.validation.incompleteMatch", {
            courtName,
            required: reqTotal,
            actual: activePlayers.length,
          })
        : `Sân ${courtName}: Trận đấu chưa xếp đủ ${reqTotal} VĐV (hiện có ${activePlayers.length}/${reqTotal} người).`
    }

    return null
  }

  const handleConfirmMatches = () => {
    const validMatches = matches.filter(
      (m) => m.players.filter(isPlayer).length > 0
    )

    if (validMatches.length === 0) {
      toast.error(
        t(
          "matches.validation.noMatchesToCommit",
          "Chưa có trận đấu nào được tạo trên sân!"
        )
      )
      return
    }

    for (const match of validMatches) {
      const errorMsg = validateMatchPlayers(match, availableCourts, t)
      if (errorMsg) {
        toast.error(errorMsg)
        return
      }
    }

    executeCommitMatches()
  }

  const executeCommitMatches = async () => {
    setShowIncompleteWarning(false)
    setIsConfirming(true)

    try {
      const validMatches = matches.filter(
        (m) => m.players.filter(isPlayer).length > 0
      )
      const payload: CommitMatchRequest[] = validMatches.map((m) => {
        const teamSize = m.matchType === "DOUBLES" ? 2 : 1
        const activePlayers = m.players.filter(isPlayer)
        const teamA = activePlayers.slice(0, teamSize).map((p) => p.id)
        const teamB = activePlayers
          .slice(teamSize, teamSize * 2)
          .map((p) => p.id)

        return {
          courtId: m.courtId,
          scheduledAt:
            scheduleTimes[m.sessionIndex] || new Date().toISOString(),
          matchType: m.matchType,
          category: "SOCIAL",
          teamA,
          teamB,
          refereeId: null,
        }
      })

      await commitRoundAction(socialId, playSessionId, {
        scheduledAt: scheduleTimes[0] || new Date().toISOString(),
        matches: payload,
      })

      usePlaySessionStore.getState().setTabValue("2")
      toast.success(t("matches.creation.successConfirm"))
      router.push(`/socials/${socialId}/play-session/${playSessionId}`)
    } catch (error: unknown) {
      const message =
        (
          error as {
            response?: { data?: { message?: string | string[] } }
            data?: { message?: string | string[] }
          }
        )?.response?.data?.message ||
        (error as { data?: { message?: string | string[] } })?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        t("matches.creation.confirmError")
      const finalMessage = Array.isArray(message) ? message.join(", ") : message
      toast.error(finalMessage)
      console.error(error)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {t("matches.creation.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("matches.creation.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              router.push(`/socials/${socialId}/play-session/${playSessionId}`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
            {t("matches.creation.back")}
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card p-4 shadow-sm sm:p-6">
        <MatchesControlPanel
          onGenerateMatches={handleGenerateMatches}
          numberOfCourts={numberOfCourts}
          bookingIds={bookingIds}
          availableCourts={availableCourts}
        />
      </Card>

      {isInitialLoading ? (
        <Card className="space-y-4 border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : matches.length > 0 || waitingParticipants.length > 0 ? (
        <div className="space-y-6">
          <Card className="overflow-x-auto border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <MatchMatrix
              courts={courts}
              matches={matches}
              allPlayers={players}
              availableCourts={availableCourts}
              waitingParticipants={waitingParticipants}
              scheduleTimes={scheduleTimes}
              onPlayerRemove={removePlayerFromMatch}
              onPlayerAdd={addPlayerToMatch}
              onMatchTypeChange={changeMatchType}
              onDeleteMatch={removeMatch}
              onPlayerSwap={swapPlayers}
            />
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              className="gap-2 px-8 font-semibold shadow-sm"
              onClick={handleConfirmMatches}
              disabled={isConfirming}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isConfirming
                ? t("common.submitting")
                : t("matches.creation.confirmButton")}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-dashed p-8 text-center sm:p-10">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div className="rounded-full border bg-muted/60 p-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("matches.creation.emptyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("matches.creation.emptyDescription")}
            </p>
          </div>
        </Card>
      )}

      <AlertDialog
        open={showIncompleteWarning}
        onOpenChange={setShowIncompleteWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("matches.creation.incompleteWarningTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("matches.creation.incompleteWarningDescription", {
                sessions: incompleteSessions.join(", "),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={executeCommitMatches}>
              {t("common.proceed")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CompleteSessionDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirmComplete={handleConfirmCompleteSession}
        unscoredMatchesCount={
          matches.filter((m) => !isMatchCompleteOrEmpty(m)).length
        }
        totalMatchesCount={matches.length}
      />
    </div>
  )
}
