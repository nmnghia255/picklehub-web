"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { GeneratedMatch } from "./create-match-form"
import CreateMatchTrigger from "./create-match-trigger"

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  matchType: "SINGLES" | "DOUBLES"
  participants: Player[]
  createdAt: Date
  round: number // critical
}

interface MatchesListProps {
  sessionId: string
  players: Player[]
}

export function MatchesList({ sessionId, players }: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleMatchesCreated = (generatedMatches: GeneratedMatch[]) => {
    const startRound = matches.length + 1
    const newMatches: Match[] = generatedMatches.map((gm, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(7)}`,
      matchType: gm.matchType,
      participants: gm.selectedPlayerIds
        .map((id) => players.find((p) => p.id === id))
        .filter((p): p is Player => !!p),
      createdAt: new Date(),
      round: startRound + idx, // round number: first new match gets startRound, second gets startRound+1, etc.
    }))
    setMatches((prev) => [...prev, ...newMatches])
  }

  const openDetail = (match: Match) => {
    setSelectedMatch(match)
    setDetailOpen(true)
  }

  const getTeams = (match: Match) => {
    const half = match.participants.length / 2
    const teamA = match.participants.slice(0, half)
    const teamB = match.participants.slice(half)
    return { teamA, teamB }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Trận đấu</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Chưa có trận đấu nào. Hãy tạo trận đấu mới bên dưới.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => openDetail(match)}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex gap-2">
                        {/* Show round badge */}
                        <Badge variant="secondary">Round {match.round}</Badge>
                        <Badge variant="outline">
                          {match.matchType === "SINGLES" ? "Đơn" : "Đôi"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {match.participants.map((p) => p.name).join(" • ")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {match.createdAt.toLocaleTimeString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <CreateMatchTrigger
              sessionId={sessionId}
              players={players}
              onMatchesCreated={handleMatchesCreated}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog - same as before, but also shows round */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết trận đấu</DialogTitle>
            <DialogDescription>Thông tin về trận đấu đã tạo.</DialogDescription>
          </DialogHeader>
          {selectedMatch &&
            (() => {
              const { teamA, teamB } = getTeams(selectedMatch)
              return (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Round {selectedMatch.round}
                    </Badge>
                    <Badge variant="outline">
                      {selectedMatch.matchType === "SINGLES" ? "Đơn" : "Đôi"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700">Team A</h4>
                      <ul className="list-inside list-disc text-sm">
                        {teamA.map((p) => (
                          <li key={p.id}>{p.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700">Team B</h4>
                      <ul className="list-inside list-disc text-sm">
                        {teamB.map((p) => (
                          <li key={p.id}>{p.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Thời gian tạo</h4>
                    <p className="text-sm">
                      {selectedMatch.createdAt.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID trận: {selectedMatch.id}
                  </div>
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
