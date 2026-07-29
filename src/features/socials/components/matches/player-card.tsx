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
  matchesPlayed?: number
  duprRating?: number | null
}

interface PlayerCardProps {
  player: Player
  skillLevelLabel: string
  skillLevelColor: string
  removeAriaLabel: string
  onRemove: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
  isDragging: boolean
  isSwapTarget?: boolean
}

export function PlayerCard({
  player,
  skillLevelLabel,
  skillLevelColor,
  removeAriaLabel,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  isDragging,
  isSwapTarget = false,
}: PlayerCardProps) {
  const ratingDisplay = player.duprRating
    ? `DUPR ${player.duprRating}`
    : skillLevelLabel

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={cn(
        "group relative flex w-full cursor-move flex-row items-center gap-3 border-border/70 bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isDragging &&
          "scale-[1.02] opacity-60 shadow-lg ring-2 ring-primary/40",
        isSwapTarget &&
          "scale-[1.01] border-2 border-dashed border-sky-500 bg-sky-500/10 shadow-md ring-2 ring-sky-500/40"
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

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {ratingDisplay && (
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex h-auto items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                  skillLevelColor
                )}
              >
                <Star className="h-3 w-3" />
                {ratingDisplay}
              </Badge>
            )}
            {typeof player.matchesPlayed === "number" && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {player.matchesPlayed} trận
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right action */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={removeAriaLabel}
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  )
}
