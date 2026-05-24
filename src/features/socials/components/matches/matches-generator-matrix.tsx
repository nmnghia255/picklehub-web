"use client"

import { CheckCircle2, Clock3 } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchCell } from "@/features/socials/components/matches/match-cell"

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
  isLoading?: boolean
}

export function MatchesGeneratorMatrix({
  courts,
  matches,
  allPlayers,
  onPlayerRemove,
  onPlayerAdd,
  onMatchTypeChange,
  onPlayerSwap,
  isLoading = false,
}: MatchesGeneratorMatrixProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<{
    matchId: string
    playerId: string
  } | null>(null)

  const getMatch = (courtIndex: number): Match | undefined => {
    return matches.find(
      (m) => m.courtId === `court-${courtIndex}` && m.sessionIndex === 0
    )
  }

  const getMatchStatus = (
    match: Match
  ): "complete" | "incomplete" | "empty" => {
    const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
    const activePlayers = match.players.filter(isPlayer)
    if (activePlayers.length === 0) return "empty"
    if (activePlayers.length < maxPlayers) return "incomplete"
    return "complete"
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

  const getBoardStatus = () => {
    if (matches.length === 0) return "empty"
    const hasIncomplete = matches.some(
      (m) => getMatchStatus(m) === "incomplete"
    )
    if (hasIncomplete) return "incomplete"
    const hasComplete = matches.some((m) => getMatchStatus(m) === "complete")
    return hasComplete ? "complete" : "empty"
  }

  const assignedPlayerIds = new Set(
    matches.flatMap((m) => m.players.filter(isPlayer).map((p) => p.id))
  )
  const waitlist = allPlayers.filter((p) => !assignedPlayerIds.has(p.id))
  const boardStatus = getBoardStatus()

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-slate-50">
            Danh sách trận đấu
          </h2>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {matches.length} trận
            </Badge>
            <Badge
              variant="outline"
              className={`${getStatusBadgeColor(boardStatus)} flex items-center gap-1 px-2 py-1 text-xs`}
            >
              {boardStatus === "complete" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">
                {boardStatus === "complete"
                  ? "Hoàn chỉnh"
                  : boardStatus === "incomplete"
                    ? "Chưa đủ người"
                    : "Trống"}
              </span>
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.max(3, courts) }).map((_, i) => (
              <Card key={`skeleton-${i}`} className="p-4">
                <Skeleton className="mb-3 h-4 w-32" />
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: courts }).map((_, courtIndex) => {
              const match = getMatch(courtIndex)
              const status = match ? getMatchStatus(match) : "empty"
              const boardPlayerIds = matches.flatMap((m) =>
                m.players.filter(isPlayer).map((p) => p.id)
              )

              return (
                <MatchCell
                  key={`court-${courtIndex}`}
                  courtLabel={`Sân ${courtIndex + 1}`}
                  match={match ?? null}
                  status={status}
                  allPlayers={allPlayers}
                  sessionPlayerIds={boardPlayerIds}
                  onPlayerRemove={onPlayerRemove}
                  onPlayerAdd={onPlayerAdd}
                  onMatchTypeChange={onMatchTypeChange}
                  onPlayerSwap={onPlayerSwap}
                  onDragStart={(playerId: string) =>
                    setDraggedPlayer({
                      matchId: match?.id ?? `court-${courtIndex}`,
                      playerId,
                    })
                  }
                  onDragEnd={() => setDraggedPlayer(null)}
                  draggedPlayer={draggedPlayer}
                />
              )
            })}
          </div>
        )}

        {waitlist.length > 0 ? (
          <Card className="border-border bg-card p-3 transition-shadow hover:shadow-sm">
            <div className="text-sm">
              <p className="font-medium text-foreground">Danh sách chờ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {waitlist.map((p) => (
                  <Card
                    key={p.id}
                    className="border-border bg-muted/30 px-3 py-1 text-xs font-medium"
                  >
                    {p.name}
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
