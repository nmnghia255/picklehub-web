"use client"

import { Plus, Sparkles } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { cn } from "@/lib/utils"

import { PlayerCard } from "./player-card"

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface DraggedPlayer {
  matchId: string
  playerId: string
}

interface MatchSlotProps {
  matchId: string
  player?: Player | null
  draggedPlayer: DraggedPlayer | null
  onPlayerRemove: (matchId: string, playerId: string) => void
  onPlayerSwap: (
    fromMatchId: string,
    toMatchId: string,
    fromPlayerId: string,
    toPlayerId: string | null
  ) => void
  onDragStart: (playerId: string) => void
  onDragEnd: () => void
  skillLevelLabel: (skillLevel?: number) => string
  skillLevelColor: (skillLevel?: number) => string
  onEmptySlotClick: () => void
}

export function MatchSlot({
  matchId,
  player,
  draggedPlayer,
  onPlayerRemove,
  onPlayerSwap,
  onDragStart,
  onDragEnd,
  skillLevelLabel,
  skillLevelColor,
  onEmptySlotClick,
}: MatchSlotProps) {
  const { t } = useSocialsTranslation()
  const [isOver, setIsOver] = React.useState(false)

  const isSwapTarget = Boolean(
    isOver &&
    draggedPlayer &&
    player &&
    (draggedPlayer.matchId !== matchId || draggedPlayer.playerId !== player.id)
  )
  const isEmptySlotTarget = Boolean(isOver && draggedPlayer && !player)

  if (player) {
    return (
      <PlayerCard
        player={player}
        skillLevelLabel={skillLevelLabel(player.skillLevel)}
        skillLevelColor={skillLevelColor(player.skillLevel)}
        removeAriaLabel={t("matches.player.removeAria", {
          name: player.name,
        })}
        onRemove={() => onPlayerRemove(matchId, player.id)}
        onDragStart={() => onDragStart(player.id)}
        onDragEnd={() => {
          setIsOver(false)
          onDragEnd()
        }}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault()
          if (!isOver) setIsOver(true)
        }}
        onDragEnter={(e: React.DragEvent) => {
          e.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={(e: React.DragEvent) => {
          e.preventDefault()
          setIsOver(false)
        }}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOver(false)
          const benchPlayerId = e.dataTransfer.getData("text/plain")
          const isBench = e.dataTransfer.getData("source") === "bench"

          if (isBench && benchPlayerId) {
            onPlayerSwap("bench", matchId, benchPlayerId, player.id)
            onDragEnd()
            return
          }

          if (!draggedPlayer) return
          if (
            draggedPlayer.matchId === matchId &&
            draggedPlayer.playerId === player.id
          )
            return

          onPlayerSwap(
            draggedPlayer.matchId,
            matchId,
            draggedPlayer.playerId,
            player.id
          )
          onDragEnd()
        }}
        isDragging={draggedPlayer?.playerId === player.id}
        isSwapTarget={isSwapTarget}
      />
    )
  }

  return (
    <Card
      onDragOver={(e) => {
        e.preventDefault()
        if (!isOver) setIsOver(true)
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        const benchPlayerId = e.dataTransfer.getData("text/plain")
        const isBench = e.dataTransfer.getData("source") === "bench"

        if (isBench && benchPlayerId) {
          onPlayerSwap("bench", matchId, benchPlayerId, null)
          onDragEnd()
          return
        }

        if (!draggedPlayer) return
        if (draggedPlayer.matchId === matchId) return

        onPlayerSwap(
          draggedPlayer.matchId,
          matchId,
          draggedPlayer.playerId,
          null
        )
        onDragEnd()
      }}
      onClick={onEmptySlotClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onEmptySlotClick()
        }
      }}
      aria-label={t("matches.slot.choosePlayerAria")}
      className={cn(
        "group flex min-h-14 w-full min-w-0 cursor-pointer items-center justify-center border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-sm active:border-primary/60 active:bg-primary/10",
        isEmptySlotTarget &&
          "scale-[1.01] border-2 border-dashed border-emerald-500 bg-emerald-500/15 text-emerald-800 shadow-md dark:text-emerald-300"
      )}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border transition-colors group-hover:text-primary",
            isEmptySlotTarget && "bg-emerald-500 text-white ring-emerald-600"
          )}
        >
          <Plus className="h-4 w-4" />
        </div>
        <span
          className={cn(
            "mt-1 flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase",
            isEmptySlotTarget &&
              "font-extrabold text-emerald-700 dark:text-emerald-300"
          )}
        >
          {t("matches.slot.choosePlayer")}
        </span>
        <span
          className={cn(
            "text-[10px] text-muted-foreground",
            isEmptySlotTarget &&
              "font-medium text-emerald-600 dark:text-emerald-400"
          )}
        >
          {t("matches.slot.dragDropHere")}
        </span>
      </div>
    </Card>
  )
}
