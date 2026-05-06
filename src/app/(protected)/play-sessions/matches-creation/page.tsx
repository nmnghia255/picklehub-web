"use client"

// MatchStatistics removed per user request
import { PageContainer } from "@/components/page-container"
import { Card } from "@/components/ui/card"
import { MatchesControlPanel } from "@/features/play-sessions/components/matches-creation/matches-control-panel"
import { MatchesGeneratorMatrix } from "@/features/play-sessions/components/matches-creation/matches-generator-matrix"
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
    selectedPlayers,
    setCourts,
    setHours,
    setSelectedPlayers,
    setMatches,
    updateMatch,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
    swapPlayers,
  } = useMatchesGeneratorStore()

  const handleGenerateMatches = () => {
    const generatedMatches = generateMockMatches(
      courts,
      hours,
      selectedPlayers.length > 0
        ? (selectedPlayers
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean) as Player[])
        : players
    )
    setMatches(generatedMatches)
  }

  const assignedPlayerIds = new Set(
    matches.flatMap((m) => m.players.map((p) => p.id))
  )

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Generator</h1>
          <p className="mt-2 text-muted-foreground">
            Generate and manage fair match pairings for your pickleball session
          </p>
        </div>

        <Card className="p-6">
          <MatchesControlPanel
            courts={courts}
            hours={hours}
            availablePlayers={players}
            selectedPlayerIds={selectedPlayers}
            onCourtsChange={setCourts}
            onHoursChange={setHours}
            onPlayersChange={setSelectedPlayers}
            onGenerateMatches={handleGenerateMatches}
          />
        </Card>

        {matches.length > 0 && (
          <Card className="overflow-x-auto p-6">
            <MatchesGeneratorMatrix
              courts={courts}
              hours={hours}
              matches={matches}
              allPlayers={players}
              onMatchUpdate={updateMatch}
              onPlayerRemove={removePlayerFromMatch}
              onPlayerAdd={addPlayerToMatch}
              onMatchTypeChange={changeMatchType}
              onPlayerSwap={swapPlayers}
            />
          </Card>
        )}
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
