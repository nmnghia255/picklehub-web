"use client"

import React, { useState } from "react"

import { Card } from "@/components/ui/card"

import { MatchCell } from "./match-cell"

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

interface MatchesGeneratorMatrixProps {
  courts: number
  hours: number
  matches: Match[]
  allPlayers: Player[]
  onPlayerRemove: (matchId: string, playerId: string) => void
  onPlayerAdd: (matchId: string, playerId: string) => void
  onMatchTypeChange: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
  onPlayerSwap: (
    fromMatchId: string,
    toMatchId: string,
    fromPlayerId: string,
    toPlayerId: string | null
  ) => void
}

export function MatchesGeneratorMatrix({
  courts,
  hours,
  matches,
  allPlayers,
  onPlayerRemove,
  onPlayerAdd,
  onMatchTypeChange,
  onPlayerSwap,
}: MatchesGeneratorMatrixProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<{
    matchId: string
    playerId: string
  } | null>(null)

  // Get matches for a specific court and session
  const getMatch = (
    courtIndex: number,
    sessionIndex: number
  ): Match | undefined => {
    return matches.find(
      (m) =>
        m.courtId === `court-${courtIndex}` && m.sessionIndex === sessionIndex
    )
  }

  // Calculate match status
  const getMatchStatus = (
    match: Match
  ): "complete" | "incomplete" | "empty" => {
    const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
    const activePlayers = match.players.filter(isPlayer)
    if (activePlayers.length === 0) return "empty"
    if (activePlayers.length < maxPlayers) return "incomplete"
    return "complete"
  }

  // Get unique players assigned to matches
  const assignedPlayerIds = new Set(
    matches.flatMap((m) => m.players.filter(isPlayer).map((p) => p.id))
  )
  const unassignedPlayers = allPlayers.filter(
    (p) => !assignedPlayerIds.has(p.id)
  )

  const getStatusColor = (
    status: "complete" | "incomplete" | "empty"
  ): string => {
    switch (status) {
      case "complete":
        return "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30"
      case "incomplete":
        return "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
      case "empty":
        return "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50"
    }
  }

  const getStatusBadgeColor = (
    status: "complete" | "incomplete" | "empty"
  ): string => {
    switch (status) {
      case "complete":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
      case "incomplete":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
      case "empty":
        return "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <h3 className="font-semibold text-foreground dark:text-slate-50">
          Bảng trận đấu
        </h3>
        <p className="text-sm text-muted-foreground dark:text-slate-400">
          {matches.length} trận • {unassignedPlayers.length} cầu thủ chưa được
          gán
        </p>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {Array.from({ length: hours }).map((_, sessionIndex) => (
          <div key={sessionIndex} className="space-y-2">
            <div className="text-sm font-medium text-foreground dark:text-slate-200">
              Phiên {sessionIndex + 1}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: courts }).map((_, courtIndex) => {
                const match = getMatch(courtIndex, sessionIndex)
                const status = match ? getMatchStatus(match) : "empty"
                const sessionPlayerIds = matches
                  .filter((m) => m.sessionIndex === sessionIndex)
                  .flatMap((m) => m.players.filter(isPlayer).map((p) => p.id))

                return (
                  <div
                    key={`${courtIndex}-${sessionIndex}`}
                    className={`flex flex-col rounded-lg border p-3 ${getStatusColor(status)}`}
                  >
                    <div className="mb-2 text-sm font-medium text-foreground dark:text-slate-200">
                      Sân {courtIndex + 1}
                    </div>
                    <div className="flex items-center justify-center">
                      {match ? (
                        <MatchCell
                          match={match}
                          status={status}
                          statusBadgeColor={getStatusBadgeColor(status)}
                          allPlayers={allPlayers}
                          sessionPlayerIds={sessionPlayerIds}
                          onPlayerRemove={onPlayerRemove}
                          onPlayerAdd={onPlayerAdd}
                          onMatchTypeChange={onMatchTypeChange}
                          onPlayerSwap={onPlayerSwap}
                          onDragStart={(playerId) =>
                            setDraggedPlayer({ matchId: match.id, playerId })
                          }
                          onDragEnd={() => setDraggedPlayer(null)}
                          draggedPlayer={draggedPlayer}
                        />
                      ) : (
                        <div className="flex items-center justify-center text-xs text-muted-foreground dark:text-slate-500">
                          Trống
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned Players Section */}
      {unassignedPlayers.length > 0 && (
        <Card className="border-sky-200 bg-sky-50 p-4 dark:border-cyan-900/60 dark:bg-slate-950/60">
          <div className="space-y-2">
            <p className="text-sm font-medium text-sky-900 dark:text-cyan-200">
              👥 Cầu thủ chưa được gán ({unassignedPlayers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {player.name}
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
