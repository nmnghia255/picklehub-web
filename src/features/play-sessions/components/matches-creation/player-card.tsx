"use client"

import { X } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface PlayerCardProps {
  player: Player
  skillLevelLabel: string
  skillLevelColor: string
  onRemove: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  isDragging: boolean
}

export function PlayerCard({
  player,
  skillLevelLabel,
  skillLevelColor,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  isDragging,
}: PlayerCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={cn(
        "flex cursor-move items-center gap-2 rounded border border-slate-200 bg-white p-2 transition-all hover:shadow-md",
        isDragging && "scale-105 border-blue-400 opacity-50 shadow-lg"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={player.avatarUrl || undefined} alt={player.name} />
        <AvatarFallback className="text-xs">
          {player.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Player Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-900">
          {player.name}
        </p>
        {skillLevelLabel && (
          <Badge className={cn("h-5 px-1.5 text-xs", skillLevelColor)}>
            {skillLevelLabel}
          </Badge>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 shrink-0 p-0 hover:bg-red-100 hover:text-red-600"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
