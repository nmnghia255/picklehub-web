"use client"

import { GripVertical, Star, UserRound, X } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={cn(
        "group relative flex w-full cursor-move flex-row items-center gap-3 border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md",
        isDragging && "scale-[1.02] opacity-60 shadow-lg ring-2 ring-primary/40"
      )}
    >
      {/* Left content */}
      <div className="flex min-w-0 flex-1 gap-3">
        <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/70">
          <AvatarImage src={player.avatarUrl || undefined} alt={player.name} />
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {player.name}
          </p>

          {skillLevelLabel && (
            <Badge
              variant="outline"
              className={cn(
                "mt-1 inline-flex h-auto items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                skillLevelColor
              )}
            >
              <Star className="h-3 w-3" />
              {skillLevelLabel}
            </Badge>
          )}
        </div>
      </div>

      {/* Right action */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Xóa ${player.name}`}
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  )
}
