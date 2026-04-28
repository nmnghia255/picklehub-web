"use client"

import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type PlayerOption = { id: string; name?: string | null }
export type GeneratedMatch = {
  matchType: "SINGLES" | "DOUBLES"
  selectedPlayerIds: string[]
}

interface CreateMatchFormProps {
  sessionId: string
  players: PlayerOption[]
  onCreate?: (matches: GeneratedMatch[]) => Promise<void> | void
  onClose?: () => void
}

export default function CreateMatchForm({
  players = [],
  onCreate,
  onClose,
}: CreateMatchFormProps) {
  const [matchType, setMatchType] = useState<"SINGLES" | "DOUBLES">("SINGLES")
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate matches based on selected players and type
  const generateMatches = (): GeneratedMatch[] => {
    const matches: GeneratedMatch[] = []
    const playersList = [...selectedPlayerIds]

    if (matchType === "SINGLES") {
      if (playersList.length === 2) {
        // 1 match: p1 vs p2
        matches.push({
          matchType,
          selectedPlayerIds: [playersList[0], playersList[1]],
        })
      } else if (playersList.length === 3) {
        // Round robin: 3 matches
        matches.push(
          { matchType, selectedPlayerIds: [playersList[0], playersList[1]] },
          { matchType, selectedPlayerIds: [playersList[1], playersList[2]] },
          { matchType, selectedPlayerIds: [playersList[0], playersList[2]] }
        )
      } else if (playersList.length === 4) {
        // Pair adjacent: p1vsp2, p3vsp4
        matches.push(
          { matchType, selectedPlayerIds: [playersList[0], playersList[1]] },
          { matchType, selectedPlayerIds: [playersList[2], playersList[3]] }
        )
      } else {
        // For more players, pair them sequentially (round 1,2,...)
        for (let i = 0; i < playersList.length; i += 2) {
          if (i + 1 < playersList.length) {
            matches.push({
              matchType,
              selectedPlayerIds: [playersList[i], playersList[i + 1]],
            })
          }
        }
      }
    } else if (matchType === "DOUBLES") {
      // Doubles requires each team of 2, and two teams per match => 4 players per match
      if (playersList.length % 4 !== 0) {
        alert("Thể thức đôi cần số lượng người chơi chia hết cho 4.")
        return []
      }
      // Group into teams sequentially: (p1,p2) vs (p3,p4) then (p5,p6) vs (p7,p8) ...
      for (let i = 0; i < playersList.length; i += 4) {
        matches.push({
          matchType,
          selectedPlayerIds: [
            playersList[i],
            playersList[i + 1],
            playersList[i + 2],
            playersList[i + 3],
          ],
        })
      }
    }

    return matches
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    // Basic validation
    if (matchType === "SINGLES" && selectedPlayerIds.length < 2) {
      alert("Thể thức đơn cần ít nhất 2 người chơi.")
      return
    }
    if (matchType === "DOUBLES" && selectedPlayerIds.length % 4 !== 0) {
      alert("Thể thức đôi cần số người chơi là bội số của 4.")
      return
    }

    const matches = generateMatches()
    if (matches.length === 0) {
      alert("Không thể tạo trận đấu với danh sách người chơi hiện tại.")
      return
    }

    try {
      setIsSubmitting(true)
      if (onCreate) await onCreate(matches)
      if (onClose) onClose()
    } catch (err) {
      console.error(err)
      alert("Có lỗi xảy ra khi tạo trận đấu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    )
  }

  const selectAll = () => {
    if (selectedPlayerIds.length === players.length) {
      setSelectedPlayerIds([])
    } else {
      setSelectedPlayerIds(players.map((p) => p.id))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Thể thức</label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={matchType === "SINGLES" ? "default" : "outline"}
            onClick={() => setMatchType("SINGLES")}
            className="flex-1 py-2"
          >
            Đơn (Singles)
          </Button>
          <Button
            type="button"
            variant={matchType === "DOUBLES" ? "default" : "outline"}
            onClick={() => setMatchType("DOUBLES")}
            className="flex-1 py-2"
          >
            Đôi (Doubles)
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Người chơi tham gia</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="text-xs"
          >
            {selectedPlayerIds.length === players.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </Button>
        </div>
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
          {players.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Không có người chơi nào.
            </div>
          ) : (
            players.map((player) => {
              const isChecked = selectedPlayerIds.includes(player.id)
              return (
                <label
                  key={player.id}
                  className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePlayer(player.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{player.name ?? player.id}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Newbie / 2.0
                  </Badge>
                </label>
              )
            })
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Đã chọn {selectedPlayerIds.length} / {players.length}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo trận đấu"}
        </Button>
      </div>
    </form>
  )
}
