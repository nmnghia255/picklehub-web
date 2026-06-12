"use client"

import { format } from "date-fns"
import { CheckCircle2, ChevronDown, Clock3 } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { MatchCell } from "@/features/socials/components/matches/match-cell"
import type { Match, Player } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

const isPlayer = (player: Player | null): player is Player => player !== null

interface MatchMatrix {
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
  scheduleTimes: string[]
}

export function MatchMatrix({
  courts,
  matches,
  allPlayers,
  onPlayerRemove,
  onPlayerAdd,
  onMatchTypeChange,
  onPlayerSwap,
  isLoading = false,
  scheduleTimes,
}: MatchMatrix) {
  const { t } = useSocialsTranslation()
  const [draggedPlayer, setDraggedPlayer] = useState<{
    matchId: string
    playerId: string
  } | null>(null)

  const getMatch = (
    courtIndex: number,
    sessionIndex: number
  ): Match | undefined => {
    const roundMatches = matches.filter((m) => m.sessionIndex === sessionIndex)
    return roundMatches[courtIndex]
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

  const getBoardStatus = (sessionMatches: Match[]) => {
    if (sessionMatches.length === 0) return "empty"
    const hasIncomplete = sessionMatches.some(
      (m) => getMatchStatus(m) === "incomplete"
    )
    if (hasIncomplete) return "incomplete"
    const hasComplete = sessionMatches.some(
      (m) => getMatchStatus(m) === "complete"
    )
    return hasComplete ? "complete" : "empty"
  }

  const sessions = Array.from(new Set(matches.map((m) => m.sessionIndex))).sort(
    (a, b) => a - b
  )
  if (sessions.length === 0) sessions.push(0)

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground dark:text-slate-50">
          {t("matches.matrix.title")}
        </h2>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {t("matches.matrix.count", { count: matches.length })}
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
        <div className="space-y-8">
          {sessions.map((sessionIndex) => {
            const sessionMatches = matches.filter(
              (m) => m.sessionIndex === sessionIndex
            )
            const assignedPlayerIds = new Set(
              sessionMatches.flatMap((m) =>
                m.players.filter(isPlayer).map((p) => p.id)
              )
            )
            const waitlist = allPlayers.filter(
              (p) => !assignedPlayerIds.has(p.id)
            )
            const boardStatus = getBoardStatus(sessionMatches)
            const boardStatusLabel = t(
              `matches.matrix.boardStatus.${boardStatus}`
            )
            const scheduledAt = scheduleTimes[sessionIndex]
            const formattedTime = scheduledAt
              ? format(new Date(scheduledAt), "HH:mm")
              : null

            return (
              <Collapsible
                key={`session-${sessionIndex}`}
                defaultOpen
                className="group space-y-4"
              >
                <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">
                      {t(`matches.matrix.session`, {
                        number: sessionIndex + 1,
                      })}
                    </h3>
                    {formattedTime && (
                      <div className="flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-border/50">
                        <Clock3 className="h-3 w-3" />
                        <span>{formattedTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 px-2 py-1 text-xs ${
                        boardStatus === "complete"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : boardStatus === "incomplete"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200"
                      }`}
                    >
                      {boardStatus === "complete" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5" />
                      )}
                      <span className="text-xs">{boardStatusLabel}</span>
                    </Badge>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent className="space-y-4 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {Array.from({ length: courts }).map((_, courtIndex) => {
                      const match = getMatch(courtIndex, sessionIndex)
                      const status = match ? getMatchStatus(match) : "empty"
                      const sessionPlayerIds = sessionMatches.flatMap((m) =>
                        m.players.filter(isPlayer).map((p) => p.id)
                      )

                      return (
                        <MatchCell
                          key={`court-${sessionIndex}-${courtIndex}`}
                          courtLabel={t("matches.court", {
                            number: courtIndex + 1,
                          })}
                          match={match ?? null}
                          status={status}
                          allPlayers={allPlayers}
                          sessionPlayerIds={sessionPlayerIds}
                          onPlayerRemove={onPlayerRemove}
                          onPlayerAdd={onPlayerAdd}
                          onMatchTypeChange={onMatchTypeChange}
                          onPlayerSwap={onPlayerSwap}
                          onDragStart={(playerId: string) =>
                            setDraggedPlayer({
                              matchId:
                                match?.id ??
                                `court-${sessionIndex}-${courtIndex}`,
                              playerId,
                            })
                          }
                          onDragEnd={() => setDraggedPlayer(null)}
                          draggedPlayer={draggedPlayer}
                        />
                      )
                    })}
                  </div>

                  {waitlist.length > 0 ? (
                    <Card className="border-amber-200 bg-amber-50 p-4 transition-shadow hover:shadow-sm dark:border-amber-900/50 dark:bg-amber-500/10">
                      <div className="text-md">
                        <p className="font-medium text-amber-800 dark:text-amber-300">
                          {t("matches.matrix.waitlist")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {waitlist.map((p) => (
                            <Card
                              key={p.id}
                              className="border-amber-200/60 bg-amber-100/50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800/60 dark:bg-amber-500/20 dark:text-amber-200"
                            >
                              {p.name}
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ) : null}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}
