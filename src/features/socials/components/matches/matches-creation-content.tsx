"use client"

import { CheckCircle2 } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMatchesGeneratorStore } from "@/features/play-sessions/stores/matches-generator-store"

import { MatchesControlPanel } from "./matches-control-panel"
import { MatchesGeneratorMatrix } from "./matches-generator-matrix"
import StatisticCard from "./statistic-card"

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
  const router = useRouter()
  const {
    courts,
    hours,
    players,
    matches,
    setCourts,
    setHours,
    setMatches,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
    swapPlayers,
  } = useMatchesGeneratorStore()

  const handleGenerateMatches = () => {
    const generatedMatches = generateMockMatches(courts, hours, players)
    setMatches(generatedMatches)
  }

  const handleConfirmMatches = () => {
    const invalidMatches = matches.filter(
      (match) => !isMatchCompleteOrEmpty(match)
    )

    if (invalidMatches.length > 0) {
      toast.error(
        `Bạn cần hoàn tất các trận đấu trước khi xác nhận. Hiện còn ${invalidMatches.length} trận chưa hoàn chỉnh.`
      )
      return
    }

    toast.success("Các trận đã sẵn sàng để host tạo cho buổi chơi.")
  }

  return (
    <div className="relative overflow-hidden rounded-3xl from-background via-background to-muted/30 px-6 py-8 text-foreground md:px-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="relative space-y-6">
        <div>
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-50">
              Trận đấu
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground dark:text-slate-400">
              Quản lý và theo dõi các trận đấu trong phiên chơi của bạn
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <Card className="border-border bg-card p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur">
          <MatchesControlPanel
            courts={courts}
            hours={hours}
            onCourtsChange={setCourts}
            onHoursChange={setHours}
            onGenerateMatches={handleGenerateMatches}
          />
        </Card>

        <Card className="border-border bg-card p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur">
          <StatisticCard matches={matches} allPlayers={players} />
        </Card>

        {matches.length > 0 && (
          <div className="space-y-4">
            <Card className="overflow-x-auto border-border bg-card p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur">
              <MatchesGeneratorMatrix
                courts={courts}
                hours={hours}
                matches={matches}
                allPlayers={players}
                onPlayerRemove={removePlayerFromMatch}
                onPlayerAdd={addPlayerToMatch}
                onMatchTypeChange={changeMatchType}
                onPlayerSwap={swapPlayers}
              />
            </Card>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div>
                <p className="font-medium text-foreground dark:text-slate-100">
                  Xác nhận tạo các trận này cho phiên chơi
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                  Giao diện xác nhận sẽ được gắn hành động sau.
                </p>
              </div>

              <Button
                size="lg"
                className="gap-2"
                onClick={handleConfirmMatches}
              >
                <CheckCircle2 className="h-4 w-4" />
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function generateMockMatches(
  courts: number,
  hours: number,
  players: Player[]
): Match[] {
  const matches: Match[] = []
  let matchId = 1

  for (let court = 0; court < courts; court++) {
    for (let session = 0; session < hours; session++) {
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
        sessionIndex: session,
        matchType,
        players: matchPlayers,
      })
    }
  }

  return matches
}
