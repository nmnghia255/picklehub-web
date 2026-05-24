"use client"

import React, { useState } from "react"

import { Card } from "@/components/ui/card"

import { MatchCellHeader } from "./match-cell-header"
import { MatchSlot } from "./match-slot"
import { PlayerSelectionDialog } from "./player-selection-dialog"

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

interface MatchCellProps {
  match: Match | null
  courtLabel: string
  status: "complete" | "incomplete" | "empty"
  allPlayers: Player[]
  sessionPlayerIds: string[]
  onPlayerRemove: (matchId: string, playerId: string) => void
  onPlayerAdd: (matchId: string, playerId: string) => void
  onMatchTypeChange: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
  onPlayerSwap: (
    fromMatchId: string,
    toMatchId: string,
    fromPlayerId: string,
    toPlayerId: string | null
  ) => void
  onDragStart: (playerId: string) => void
  onDragEnd: () => void
  draggedPlayer: { matchId: string; playerId: string } | null
}

const statusTexts = {
  complete: "✓ Đầy đủ",
  incomplete: "! Thiếu cầu thủ",
  empty: "Không có trận",
}

const statusLabels = {
  complete: {
    label: "Đủ",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    cardColor:
      "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
  },
  incomplete: {
    label: "Thiếu",
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    cardColor:
      "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20",
  },
  empty: {
    label: "Trống",
    badgeColor:
      "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
    cardColor:
      "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/30",
  },
}

export function MatchCell({
  match,
  courtLabel,
  status,
  allPlayers,
  sessionPlayerIds,
  onPlayerRemove,
  onPlayerAdd,
  onMatchTypeChange,
  onPlayerSwap,
  onDragStart,
  onDragEnd,
  draggedPlayer,
}: MatchCellProps) {
  const [selectedEmptySlot, setSelectedEmptySlot] = useState<{
    side: "left" | "right"
    index: number
  } | null>(null)

  const maxPlayers = match ? (match.matchType === "DOUBLES" ? 4 : 2) : 0
  const emptySlots = match ? maxPlayers - match.players.length : 0

  const availablePlayersForAdd = allPlayers.filter(
    (player) =>
      !match?.players.find((matchPlayer) => matchPlayer?.id === player.id) &&
      !sessionPlayerIds.includes(player.id)
  )

  const skillLevelLabel = (skillLevel?: number) => {
    const scores = [
      "",
      "2.0",
      "2.25",
      "2.5",
      "2.75",
      "3.0",
      "3.25",
      "3.5",
      "3.75",
      "4.0",
      "4.25",
      "4.5",
      "4.75",
      "5.0+",
    ]
    return skillLevel ? scores[skillLevel] || scores[scores.length - 1] : ""
  }

  const getSkillLevelColor = (skillLevel?: number): string => {
    const colors: Record<number, string> = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    }

    return skillLevel && skillLevel in colors ? colors[skillLevel] : ""
  }

  const leftSlotCount = Math.ceil(maxPlayers / 2)
  const rightSlotCount = Math.floor(maxPlayers / 2)
  const selectedSlotLabel = selectedEmptySlot
    ? `${selectedEmptySlot.side === "left" ? "bên trái" : "bên phải"} vị trí ${selectedEmptySlot.index + 1}`
    : undefined
  const statusStyle = statusLabels[status]

  if (!match) {
    return (
      <Card
        className={`flex min-h-64 w-full flex-col overflow-hidden border p-3 transition-all hover:shadow-md ${statusStyle.cardColor}`}
      >
        <MatchCellHeader
          courtLabel={courtLabel}
          matchId={courtLabel}
          matchTypeLabel="Trận"
          statusText={statusTexts.empty}
          statusBadgeColor={statusStyle.badgeColor}
          onMatchTypeChange={onMatchTypeChange}
        />

        <div className="flex min-h-40 flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Trống</p>
            <p className="text-xs text-muted-foreground">
              Chưa có trận cho sân này
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`group flex h-full w-full min-w-0 flex-col overflow-hidden border p-4 transition-all hover:shadow-md ${statusStyle.cardColor}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        if (!draggedPlayer) return
        if (draggedPlayer.matchId === match.id) return

        if (emptySlots > 0) {
          onPlayerSwap(
            draggedPlayer.matchId,
            match.id,
            draggedPlayer.playerId,
            null
          )
          onDragEnd()
        }
      }}
    >
      <MatchCellHeader
        courtLabel={courtLabel}
        matchId={match.id}
        matchTypeLabel={match.matchType === "SINGLES" ? "Đơn" : "Đôi"}
        statusText={statusTexts[status]}
        statusBadgeColor={statusStyle.badgeColor}
        onMatchTypeChange={onMatchTypeChange}
      />

      {/* Slot Container */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 overflow-hidden py-2">
          <div className="flex w-full flex-col items-center gap-2">
            {Array.from({ length: leftSlotCount }).map((_, idx) => (
              <MatchSlot
                key={`left-${idx}`}
                matchId={match.id}
                player={match.players[idx]}
                draggedPlayer={draggedPlayer}
                onPlayerRemove={onPlayerRemove}
                onPlayerSwap={onPlayerSwap}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                skillLevelLabel={skillLevelLabel}
                skillLevelColor={getSkillLevelColor}
                onEmptySlotClick={() =>
                  setSelectedEmptySlot({ side: "left", index: idx })
                }
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-12 shrink-0 items-center justify-center">
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <div className="h-2 w-2 rounded-full bg-border" />
            <div className="h-24 w-px rounded-full bg-linear-to-b from-border via-border/60 to-border" />
            <div className="h-2 w-2 rounded-full bg-border" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 overflow-hidden py-2">
          <div className="flex w-full flex-col items-center gap-2">
            {Array.from({ length: rightSlotCount }).map((_, idx) => {
              const playerIndex = leftSlotCount + idx
              return (
                <MatchSlot
                  key={`right-${idx}`}
                  matchId={match.id}
                  player={match.players[playerIndex]}
                  draggedPlayer={draggedPlayer}
                  onPlayerRemove={onPlayerRemove}
                  onPlayerSwap={onPlayerSwap}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  skillLevelLabel={skillLevelLabel}
                  skillLevelColor={getSkillLevelColor}
                  onEmptySlotClick={() =>
                    setSelectedEmptySlot({ side: "right", index: idx })
                  }
                />
              )
            })}
          </div>
        </div>
      </div>

      <PlayerSelectionDialog
        open={selectedEmptySlot !== null}
        slotLabel={selectedSlotLabel}
        players={availablePlayersForAdd}
        sessionPlayerIds={sessionPlayerIds}
        skillLevelLabel={skillLevelLabel}
        onClose={() => setSelectedEmptySlot(null)}
        onSelect={(playerId) => {
          onPlayerAdd(match.id, playerId)
          setSelectedEmptySlot(null)
        }}
      />
    </Card>
  )
}

export default MatchCell
