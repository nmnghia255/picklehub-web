"use client"

// MatchStatistics removed per user request
import { PageContainer } from "@/components/page-container"
import { Card } from "@/components/ui/card"
import { MatchesControlPanel } from "@/features/play-sessions/components/matches/matches-control-panel"
import { MatchesGeneratorMatrix } from "@/features/play-sessions/components/matches/matches-generator-matrix"
import { useMatchesGeneratorStore } from "@/features/play-sessions/stores/matches-generator-store"

interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: "SINGLES" | "DOUBLES"
  players: Player[]
}

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

export default function MatchesCreationPage() {
  const {
    courts,
    hours,
    players,
    matches,
    setCourts,
    setHours,
    setMatches,
    updateMatch,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
    swapPlayers,
  } = useMatchesGeneratorStore()

  const handleGenerateMatches = () => {
    const generatedMatches = generateMockMatches(courts, hours, players)
    setMatches(generatedMatches)
  }

  return (
    <PageContainer>
      <div className="relative overflow-hidden rounded-3xl from-background via-background to-muted/30 px-6 py-8 text-foreground md:px-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
        {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_28%)] opacity-0 dark:opacity-100" /> */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-50">
              Trận đấu
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground dark:text-slate-400">
              Quản lý và theo dõi các trận đấu trong buổi chơi của bạn
            </p>
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

          {matches.length > 0 && (
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
          )}
        </div>
      </div>
    </PageContainer>
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
