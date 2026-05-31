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

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchesControlPanel } from "@/features/socials/components/matches/matches-control-panel"
import { MatchesGeneratorMatrix } from "@/features/socials/components/matches/matches-generator-matrix"
import StatisticCard from "@/features/socials/components/matches/statistic-card"
import { useMatchesGeneratorStore } from "@/features/socials/stores/matches-generator-store"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: "SINGLES" | "DOUBLES"
  players: Array<Player | null>
}

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

const isPlayer = (player: Player | null): player is Player => player !== null

function isMatchCompleteOrEmpty(match: Match): boolean {
  const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
  const activePlayers = match.players.filter(isPlayer).length
  return activePlayers === 0 || activePlayers === maxPlayers
}

export function MatchesCreationContent() {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [totalMatches, setTotalMatches] = useState(2)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoading(false), 450)
    return () => window.clearTimeout(timer)
  }, [])

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
  } = useMatchesGeneratorStore()

  const handleCourtsChange = (nextCourts: number) => {
    setCourts(nextCourts)
  }

  const handleGenerateMatches = () => {
    const generatedMatches = generateMockMatches(courts, totalMatches, players)
    setMatches(generatedMatches)
  }

  const handleConfirmMatches = () => {
    const invalidMatches = matches.filter(
      (match) => !isMatchCompleteOrEmpty(match)
    )

    if (invalidMatches.length > 0) {
      toast.error(
        t("matches.creation.confirmError", { count: invalidMatches.length })
      )
      return
    }

    toast.success(t("matches.creation.success"))
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
          <MatchesControlPanel
            courts={courts}
            totalMatches={totalMatches}
            onCourtsChange={handleCourtsChange}
            onTotalMatchesChange={setTotalMatches}
            onGenerateMatches={handleGenerateMatches}
          />
        </Card>

        <Card className="border-border bg-card p-4 shadow-sm sm:p-6">
          <StatisticCard
            matches={matches}
            allPlayers={players}
            courts={courts}
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
              <MatchesGeneratorMatrix
                courts={courts}
                matches={matches}
                allPlayers={players}
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
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("matches.creation.confirmButton")}
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
    </div>
  )
}

function generateMockMatches(
  courts: number,
  totalMatches: number,
  players: Player[]
): Match[] {
  const matches: Match[] = []
  let matchId = 1
  const matchCount = Math.min(totalMatches, courts)

  for (let court = 0; court < matchCount; court++) {
    const matchType = Math.random() > 0.3 ? "DOUBLES" : "SINGLES"
    const playerCount = matchType === "DOUBLES" ? 4 : 2

    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const matchPlayers = shuffled.slice(
      0,
      Math.min(playerCount, shuffled.length)
    )

    matches.push({
      id: `match-${matchId++}`,
      courtId: `court-${court}`,
      sessionIndex: 0,
      matchType,
      players: matchPlayers,
    })
  }

  return matches
}
