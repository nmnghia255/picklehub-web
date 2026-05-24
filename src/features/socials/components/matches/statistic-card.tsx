"use client"

import {
  Activity,
  CheckCircle2,
  Clock3,
  Gauge,
  TableCellsMerge,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: "SINGLES" | "DOUBLES"
  players: Array<Player | null>
}

const isPlayer = (player: Player | null): player is Player => player !== null

export function StatisticCard({
  matches,
  allPlayers,
  courts,
  isLoading = false,
}: {
  matches: Match[]
  allPlayers: Player[]
  courts: number
  isLoading?: boolean
}) {
  const totalMatches = matches.length

  const playerMatchCounts: Record<string, number> = {}
  for (const m of matches) {
    for (const p of m.players.filter(isPlayer)) {
      playerMatchCounts[p.id] = (playerMatchCounts[p.id] || 0) + 1
    }
  }

  const totalPlayers = allPlayers.length
  const assignedPlayers = new Set(
    matches.flatMap((m) => m.players.filter(isPlayer).map((p) => p.id))
  ).size
  const maxMatchesPerPlayer = Math.max(...Object.values(playerMatchCounts), 1)

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

  const boardStatus = (() => {
    if (matches.length === 0) return "empty" as const
    const hasIncomplete = matches.some(
      (m) => getMatchStatus(m) === "incomplete"
    )
    if (hasIncomplete) return "incomplete" as const
    const hasComplete = matches.some((m) => getMatchStatus(m) === "complete")
    return hasComplete ? ("complete" as const) : ("empty" as const)
  })()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-52 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Thông số trận đấu
        </h2>
        <p className="text-sm text-muted-foreground">
          Theo dõi mức độ phân bổ trận trong một phiên chơi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="group border-border/70 p-4 transition-all">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-muted-foreground">Tổng số trận</Label>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMatches}</p>
        </Card>

        <Card className="group border-border/70 p-4 transition-all">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-muted-foreground">Người chơi</Label>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPlayers}</p>
        </Card>

        <Card className="group border-border/70 p-4 transition-all">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-muted-foreground">Đã xếp trận</Label>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {assignedPlayers}
          </p>
        </Card>
      </div>

      {/* Overview moved to matrix as a compact status badge */}

      <Card className="border-border/70 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Số trận theo người chơi
          </h3>
        </div>

        {allPlayers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Chưa có người chơi để hiển thị thống kê.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người chơi</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead className="text-right">Số trận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPlayers
                  .slice()
                  .sort(
                    (a, b) =>
                      (playerMatchCounts[b.id] || 0) -
                      (playerMatchCounts[a.id] || 0)
                  )
                  .map((p) => {
                    const count = playerMatchCounts[p.id] || 0
                    const fill = Math.round((count / maxMatchesPerPlayer) * 100)

                    return (
                      <TableRow key={p.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {(p.name || "")
                                .split(" ")
                                .map((s) => s[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <span className="truncate font-medium text-foreground">
                              {p.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeof p.skillLevel === "number"
                              ? `Level ${p.skillLevel}`
                              : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={fill} className="h-2 w-28" />
                            <span className="text-xs text-muted-foreground">
                              {fill}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{count} trận</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default StatisticCard
