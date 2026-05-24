"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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
}: {
  matches: Match[]
  allPlayers: Player[]
}) {
  const totalMatches = matches.length

  const playerMatchCounts: Record<string, number> = {}
  for (const m of matches) {
    for (const p of m.players.filter(isPlayer)) {
      playerMatchCounts[p.id] = (playerMatchCounts[p.id] || 0) + 1
    }
  }

  const uniqueSessions = new Set(matches.map((m) => m.sessionIndex)).size
  const totalPlayers = allPlayers.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground dark:text-slate-50">
          Thông số trận đấu
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-foreground dark:text-slate-200">
              Tổng số trận
            </Label>
            <Card>
              <div className="p-4 text-center text-xl font-bold text-foreground dark:text-slate-100">
                {totalMatches}
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground dark:text-slate-200">
              Số phiên
            </Label>
            <Card>
              <div className="p-4 text-center text-xl font-bold text-foreground dark:text-slate-100">
                {uniqueSessions}
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground dark:text-slate-200">
              Người chơi
            </Label>
            <Card>
              <div className="p-4 text-center text-xl font-bold text-foreground dark:text-slate-100">
                {totalPlayers}
              </div>
            </Card>
          </div>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground dark:text-slate-50">
          Số trận theo người chơi
        </h2>

        <div className="mt-2 max-h-56 divide-y overflow-y-auto rounded-md border border-border p-2 dark:border-slate-700">
          {allPlayers.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chưa có người chơi
            </div>
          ) : (
            allPlayers
              .slice()
              .sort(
                (a, b) =>
                  (playerMatchCounts[b.id] || 0) -
                  (playerMatchCounts[a.id] || 0)
              )
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {(p.name || "")
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </div>
                      {typeof p.skillLevel === "number" && (
                        <div className="text-xs text-muted-foreground">
                          Level {p.skillLevel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {playerMatchCounts[p.id] || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">trận</div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticCard
