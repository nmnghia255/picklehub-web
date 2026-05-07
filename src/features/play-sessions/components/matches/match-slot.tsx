"use client"

import React from "react"

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
  player?: Player
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
    <div
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
      className="flex h-12 w-full min-w-0 cursor-pointer items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:border-blue-500 active:bg-blue-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-cyan-400/60 dark:hover:bg-slate-900 dark:hover:text-slate-100 dark:active:border-cyan-300/70 dark:active:bg-slate-900/90"
    >
      <span className="flex items-center gap-1">
        <span className="text-base leading-none">+</span>
        <span>Nhấp để chọn</span>
      </span>
    </div>
  )
}
