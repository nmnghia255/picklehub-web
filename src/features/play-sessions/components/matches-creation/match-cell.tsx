"use client"

import { MoreVertical, Plus } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { PlayerCard } from "./player-card"

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
  complete: "✓ Full",
  incomplete: "! Missing Players",
  empty: "No Match",
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
  const maxPlayers = match.matchType === "DOUBLES" ? 4 : 2
  const emptySlots = maxPlayers - match.players.length

  // Get available players (not already in this match, but can be from other matches)
  const availablePlayersForAdd = allPlayers.filter(
    (p) => !match.players.find((mp) => mp.id === p.id)
  )

  const skillLevelLabel = (skillLevel?: number) => {
    const levels = ["", "Beginner", "Intermediate", "Advanced", "Expert", "Pro"]
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

  return (
    <div
      className="flex h-full flex-col space-y-3"
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
      {/* Header: Match Type and Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {match.matchType}
          </Badge>
          <Badge className={`text-xs ${statusBadgeColor}`}>
            {statusTexts[status]}
          </Badge>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onMatchTypeChange(match.id, "SINGLES")}
            >
              Change to Singles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMatchTypeChange(match.id, "DOUBLES")}
            >
              Change to Doubles
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Players List */}
      <div className="flex-1 space-y-2">
        {match.players.length > 0 && (
          <div className="space-y-1">
            {match.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                skillLevelLabel={skillLevelLabel(player.skillLevel)}
                skillLevelColor={getSkillLevelColor(player.skillLevel)}
                onRemove={() => onPlayerRemove(match.id, player.id)}
                onDragStart={() => onDragStart(player.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  // Drop onto a specific player -> swap players between matches
                  if (!draggedPlayer) return
                  if (
                    draggedPlayer.matchId === match.id &&
                    draggedPlayer.playerId === player.id
                  )
                    return

                  onPlayerSwap(
                    draggedPlayer.matchId,
                    match.id,
                    draggedPlayer.playerId,
                    player.id
                  )
                  onDragEnd()
                }}
                isDragging={draggedPlayer?.playerId === player.id}
              />
            ))}
          </div>
        )}

        {/* Empty Slots */}
        {emptySlots > 0 && (
          <div className="space-y-1">
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex h-9 items-center justify-center rounded border-2 border-dashed border-slate-300 text-xs text-slate-400 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Empty slot
              </div>
            ))}
          </div>
        )}
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
                  <SelectValue placeholder="Select a player..." />
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
                Cancel
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
              Add Player
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
