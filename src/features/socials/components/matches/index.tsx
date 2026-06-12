"use client"

import {
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
  confirmSuggestedMatchesAction,
  suggestMatches,
} from "@/features/socials/actions/suggested-matches"
import { MatchMatrix } from "@/features/socials/components/matches/match-matrix"
import { MatchesControlPanel } from "@/features/socials/components/matches/matches-control-panel"
import { StatisticCard } from "@/features/socials/components/matches/statistic-card"
import { useMatchesGeneratorStore } from "@/features/socials/stores/matches-generator-store"
import type { Match, Player } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

const isPlayer = (player: Player | null): player is Player => player !== null

function isMatchCompleteOrEmpty(match: Match): boolean {
  const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
  const activePlayers = match.players.filter(isPlayer).length
  return activePlayers === 0 || activePlayers === maxPlayers
}

import { useParams } from "next/navigation"

import type {
  CommitMatchRequest,
  SuggestedMatchBatchResponse,
  SuggestedMatchRequest,
} from "@/features/socials/types/match"

interface MatchesCreationContentProps {
  initialPlayers: Player[]
}

export function MatchesCreationContent({
  initialPlayers,
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

  const {
    courts,
    players,
    matches,
    setCourts,
    setMatches,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
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

      batch.rounds.forEach((round) => {
        newScheduleTimes[round.roundIndex] = round.scheduledAt

        round.matches.forEach((m) => {
          const matchPlayers: Array<Player | null> = []

          m.teamA.forEach((p) => {
            matchPlayers.push({
              id: p.participantId,
              name: p.user?.fullName || "Unknown Player",
              avatarUrl: p.user?.avatarUrl,
              skillLevel: p.user?.selfRating,
            })
          })

          m.teamB.forEach((p) => {
            matchPlayers.push({
              id: p.participantId,
              name: p.user?.fullName || "Unknown Player",
              avatarUrl: p.user?.avatarUrl,
              skillLevel: p.user?.selfRating,
            })
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

      setCourts(request.singlesCount + request.doublesCount)
      setMatches(newMatches)
      setScheduleTimes(newScheduleTimes)
      toast.success(
        t("matches.creation.generateSuccess", {
          defaultValue: "Matches generated successfully!",
        })
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to generate matches."
      toast.error(
        message ||
          t("matches.creation.generateError", {
            defaultValue: "Failed to generate matches.",
          })
      )
      console.error(error)
    }
  }

  const handleConfirmMatches = () => {
    const validMatches = matches.filter(
      (m) => m.players.filter(isPlayer).length > 0
    )

    if (validMatches.length === 0) {
      toast.error(
        t("matches.creation.noMatchesError", {
          defaultValue: "Please assign players to at least one match.",
        })
      )
      return
    }

    const invalidMatches = validMatches.filter(
      (match) => !isMatchCompleteOrEmpty(match)
    )

    if (invalidMatches.length > 0) {
      const invalidSessions = Array.from(
        new Set(invalidMatches.map((m) => m.sessionIndex + 1))
      ).sort((a, b) => a - b)
      setIncompleteSessions(invalidSessions)
      setShowIncompleteWarning(true)
      return
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

      const response = await confirmSuggestedMatchesAction(
        socialId,
        playSessionId,
        payload
      )

      toast.success(t("matches.creation.successConfirm"))
      router.back()
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("matches.creation.confirmError")
      toast.error(message)
      console.error(error)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="rounded-2xl border bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t("matches.creation.badge")}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("matches.creation.title")}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {t("matches.creation.subtitle")}
              </p>
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
        </div>

        <Card className="border-border bg-card p-4 shadow-sm sm:p-6">
          <MatchesControlPanel onGenerateMatches={handleGenerateMatches} />
        </Card>

        <Card className="border-border bg-card p-4 shadow-sm sm:p-6">
          <StatisticCard
            matches={matches}
            allPlayers={players}
            isLoading={isInitialLoading}
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
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            <Card className="overflow-x-auto border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <MatchMatrix
                courts={courts}
                matches={matches}
                allPlayers={players}
                scheduleTimes={scheduleTimes}
                onPlayerRemove={removePlayerFromMatch}
                onPlayerAdd={addPlayerToMatch}
                onMatchTypeChange={changeMatchType}
                onPlayerSwap={swapPlayers}
              />
            </Card>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {t("matches.creation.confirmTitle")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("matches.creation.confirmDescription")}
                </p>
              </div>

              <Button
                size="lg"
                className="gap-2 self-start sm:self-auto"
                onClick={handleConfirmMatches}
                disabled={isConfirming}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isConfirming
                  ? t("common.submitting", { defaultValue: "Submitting..." })
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
      </div>

      <AlertDialog
        open={showIncompleteWarning}
        onOpenChange={setShowIncompleteWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("matches.creation.incompleteWarningTitle", {
                defaultValue: "Incomplete Matches",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("matches.creation.incompleteWarningDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeCommitMatches}>
              {t("common.proceed", { defaultValue: "Proceed" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
