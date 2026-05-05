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
    historyIndex,
    history,
    setCourts,
    setHours,
    setSelectedPlayers,
    setMatches,
    updateMatch,
    removePlayerFromMatch,
    addPlayerToMatch,
    changeMatchType,
    swapPlayers,
    undo,
    redo,
  } = useMatchesGeneratorStore()

  const handleExport = () => {
    const csv = generateCSV(matches, players)
    downloadCSV(csv, `matches-${new Date().toISOString().split("T")[0]}.csv`)
  }

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
  const assignedPlayersCount = assignedPlayerIds.size

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

function generateCSV(matches: Match[], players: Player[]): string {
  const rows: string[] = []
  rows.push("Court,Session,Match Type,Players,Skill Levels")

  matches.forEach((match) => {
    const playerNames = match.players.map((p) => p.name).join(" & ")
    const skillLevels = match.players.map((p) => p.skillLevel || "-").join(", ")
    const courtNum = parseInt(match.courtId.split("-")[1]) + 1
    const sessionNum = match.sessionIndex + 1

    rows.push(
      `Court ${courtNum},Session ${sessionNum},${match.matchType},"${playerNames}","${skillLevels}"`
    )
  })

  return rows.join("\n")
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
