"use client"

import React, { useState } from "react"

import { Card } from "@/components/ui/card"

import { MatchCell } from "./match-cell"

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

interface MatchesGeneratorMatrixProps {
  courts: number
  hours: number
  matches: Match[]
  allPlayers: Player[]
  onMatchUpdate: (match: Match) => void
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
  onMatchUpdate,
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
    if (match.players.length === 0) return "empty"
    if (match.players.length < maxPlayers) return "incomplete"
    return "complete"
  }

  // Get unique players assigned to matches
  const assignedPlayerIds = new Set(
    matches.flatMap((m) => m.players.map((p) => p.id))
  )
  const unassignedPlayers = allPlayers.filter(
    (p) => !assignedPlayerIds.has(p.id)
  )

  const getStatusColor = (
    status: "complete" | "incomplete" | "empty"
  ): string => {
    switch (status) {
      case "complete":
        return "border-green-200 bg-green-50"
      case "incomplete":
        return "border-amber-200 bg-amber-50"
      case "empty":
        return "border-gray-200 bg-gray-50"
    }
  }

  const getStatusBadgeColor = (
    status: "complete" | "incomplete" | "empty"
  ): string => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800"
      case "incomplete":
        return "bg-amber-100 text-amber-800"
      case "empty":
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <h3 className="font-semibold">Bảng trận đấu</h3>
        <p className="text-sm text-muted-foreground">
          {matches.length} trận • {unassignedPlayers.length} cầu thủ chưa được
          gán
        </p>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {Array.from({ length: hours }).map((_, sessionIndex) => (
          <div key={sessionIndex} className="space-y-2">
            <div className="text-sm font-medium text-slate-700">
              Phiên {sessionIndex + 1}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: courts }).map((_, courtIndex) => {
                const match = getMatch(courtIndex, sessionIndex)
                const status = match ? getMatchStatus(match) : "empty"

                return (
                  <div
                    key={`${courtIndex}-${sessionIndex}`}
                    className={`flex flex-col rounded-lg border p-3 ${getStatusColor(status)}`}
                  >
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Sân {courtIndex + 1}
                    </div>
                    <div className="flex items-center justify-center">
                      {match ? (
                        <MatchCell
                          match={match}
                          status={status}
                          statusBadgeColor={getStatusBadgeColor(status)}
                          allPlayers={allPlayers}
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
                        <div className="flex items-center justify-center text-xs text-muted-foreground">
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
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">
              👥 Cầu thủ chưa được gán ({unassignedPlayers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-900"
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
