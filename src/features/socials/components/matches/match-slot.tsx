"use client"

import { Plus, Sparkles } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  if (player) {
    return (
      <PlayerCard
        player={player}
        skillLevelLabel={skillLevelLabel(player.skillLevel)}
        skillLevelColor={skillLevelColor(player.skillLevel)}
        onRemove={() => onPlayerRemove(matchId, player.id)}
        onDragStart={() => onDragStart(player.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
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
      />
    )
  }

  return (
    <Card
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
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
      aria-label="Chọn cầu thủ cho ô trống"
      className={cn(
        "group flex min-h-14 w-full min-w-0 cursor-pointer items-center justify-center border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-sm active:border-primary/60 active:bg-primary/10"
      )}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border transition-colors group-hover:text-primary">
          <Plus className="h-4 w-4" />
        </div>
        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
          Nhấp để chọn
        </span>
        {/* <span className="text-[10px] text-muted-foreground">Hoặc kéo thả vào đây</span> */}
      </div>
    </Card>
  )
}
