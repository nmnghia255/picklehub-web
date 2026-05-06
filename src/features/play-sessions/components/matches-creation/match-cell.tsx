"use client"

import { Plus } from "lucide-react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { MatchCellHeader } from "./match-cell-header"
import { MatchSlot } from "./match-slot"
import { PlayerSelectionDialog } from "./player-selection-dialog"

interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: "SINGLES" | "DOUBLES"
  players: Player[]
}

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface MatchCellProps {
  match: Match
  status: "complete" | "incomplete" | "empty"
  statusBadgeColor: string
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
  onDragStart: (playerId: string) => void
  onDragEnd: () => void
  draggedPlayer: { matchId: string; playerId: string } | null
}

const statusTexts = {
  complete: "✓ Đầy đủ",
  incomplete: "! Thiếu cầu thủ",
  empty: "Không có trận",
}

export function MatchCell({
  match,
  status,
  statusBadgeColor,
  allPlayers,
  onPlayerRemove,
  onPlayerAdd,
  onMatchTypeChange,
  onPlayerSwap,
  onDragStart,
  onDragEnd,
  draggedPlayer,
}: MatchCellProps) {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [selectedEmptySlot, setSelectedEmptySlot] = useState<{
    side: "left" | "right"
    index: number
  } | null>(null)
  const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
  const emptySlots = maxPlayers - match.players.length

  // Get available players (not already in this match, but can be from other matches)
  const availablePlayersForAdd = allPlayers.filter(
    (p) => !match.players.find((mp) => mp.id === p.id)
  )

  const skillLevelLabel = (skillLevel?: number) => {
    const levels = [
      "",
      "Người mới bắt đầu",
      "Trung cấp",
      "Nâng cao",
      "Chuyên gia",
      "Chuyên nghiệp",
    ]
    return skillLevel ? levels[skillLevel] || "" : ""
  }

  const getSkillLevelColor = (skillLevel?: number): string => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    }
    return skillLevel && skillLevel in colors
      ? colors[skillLevel as keyof typeof colors]
      : ""
  }

  const leftSlotCount = Math.ceil(maxPlayers / 2)
  const rightSlotCount = Math.floor(maxPlayers / 2)
  const selectedSlotLabel = selectedEmptySlot
    ? `${selectedEmptySlot.side === "left" ? "bên trái" : "bên phải"} vị trí ${selectedEmptySlot.index + 1}`
    : undefined

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col space-y-3 overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        // Drop onto the cell (not a specific player) -> move player into this match if possible
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
        // If no empty slots, do nothing (user can drop onto a player to swap)
      }}
    >
      <MatchCellHeader
        matchId={match.id}
        matchTypeLabel={match.matchType === "SINGLES" ? "Đơn" : "Đôi"}
        statusText={statusTexts[status]}
        statusBadgeColor={statusBadgeColor}
        onMatchTypeChange={onMatchTypeChange}
      />

      {/* Court Layout: left team | net | right team */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 overflow-hidden">
          {/* Left side slots */}
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

        {/* Net */}
        <div className="flex w-12 shrink-0 items-center justify-center">
          <div className="h-24 w-0.5 bg-slate-400" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 overflow-hidden">
          {/* Right side slots */}
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

      {/* Add Player Button */}
      {emptySlots > 0 && availablePlayersForAdd.length > 0 && (
        <div>
          {isAddingPlayer ? (
            <div className="space-y-1">
              <Select
                onValueChange={(playerId) => {
                  onPlayerAdd(match.id, playerId)
                  setIsAddingPlayer(false)
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chọn một cầu thủ..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayersForAdd.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                      {player.skillLevel &&
                        ` (${skillLevelLabel(player.skillLevel)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-full text-xs"
                onClick={() => setIsAddingPlayer(false)}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-full gap-1 text-xs"
              onClick={() => setIsAddingPlayer(true)}
            >
              <Plus className="h-3 w-3" />
              Thêm cầu thủ
            </Button>
          )}
        </div>
      )}

      <PlayerSelectionDialog
        open={selectedEmptySlot !== null}
        slotLabel={selectedSlotLabel}
        players={availablePlayersForAdd}
        skillLevelLabel={skillLevelLabel}
        onClose={() => setSelectedEmptySlot(null)}
        onSelect={(playerId) => {
          onPlayerAdd(match.id, playerId)
          setSelectedEmptySlot(null)
        }}
      />
    </div>
  )
}
