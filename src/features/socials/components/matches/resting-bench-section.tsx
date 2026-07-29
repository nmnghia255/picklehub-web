"use client"

import { Coffee, User } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface RestingBenchSectionProps {
  waitingParticipants: Player[]
  onDragStart?: (playerId: string) => void
  onDragEnd?: () => void
  onPlayerDrop?: (fromMatchId: string, playerId: string) => void
  draggedPlayer?: { matchId: string; playerId: string } | null
}

export function RestingBenchSection({
  waitingParticipants,
  onDragStart,
  onDragEnd,
  onPlayerDrop,
  draggedPlayer,
}: RestingBenchSectionProps) {
  const { t } = useSocialsTranslation()
  const [isOver, setIsOver] = React.useState(false)
  const isDraggingFromMatch = Boolean(
    draggedPlayer && draggedPlayer.matchId !== "bench"
  )

  return (
    <Card
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (!isOver) setIsOver(true)
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        if (isDraggingFromMatch) setIsOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        if (draggedPlayer && draggedPlayer.matchId !== "bench") {
          if (onPlayerDrop) {
            onPlayerDrop(draggedPlayer.matchId, draggedPlayer.playerId)
          }
          if (onDragEnd) onDragEnd()
        } else {
          const pId = e.dataTransfer.getData("text/plain")
          const src = e.dataTransfer.getData("source")
          if (pId && src && src !== "bench") {
            if (onPlayerDrop) {
              onPlayerDrop(src, pId)
            }
            if (onDragEnd) onDragEnd()
          }
        }
      }}
      className={`border transition-all duration-200 ${
        isOver && isDraggingFromMatch
          ? "scale-[1.01] border-2 border-dashed border-amber-500 bg-amber-500/20 shadow-lg"
          : "bg-amber-500/5 dark:bg-amber-500/10"
      }`}
    >
      <CardHeader className="py-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Coffee className="size-5" />
            <span>{t("matches.bench.title")}</span>
          </div>
          <Badge variant="secondary" className="rounded-full text-xs">
            {t("matches.bench.playerCount", {
              count: waitingParticipants.length,
            })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {waitingParticipants.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            {t("matches.bench.empty")}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {waitingParticipants.map((player) => {
              const ratingDisplay = player.duprRating
                ? `DUPR ${player.duprRating}`
                : player.skillLevel
                  ? `Rating ${player.skillLevel}`
                  : null

              return (
                <div
                  key={player.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", player.id)
                    e.dataTransfer.setData("source", "bench")
                    if (onDragStart) onDragStart(player.id)
                  }}
                  onDragEnd={() => {
                    if (onDragEnd) onDragEnd()
                  }}
                  className="flex cursor-grab items-center gap-2 rounded-xl border bg-card p-2 shadow-xs transition-all hover:scale-102 hover:border-primary/50 active:cursor-grabbing"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={player.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs leading-tight font-semibold">
                      {player.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                      {ratingDisplay && (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {ratingDisplay}
                        </span>
                      )}
                      <span className="py-0.2 rounded bg-muted px-1 font-mono text-muted-foreground">
                        {t("matches.bench.matchesPlayed", {
                          count: player.matchesPlayed ?? 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
