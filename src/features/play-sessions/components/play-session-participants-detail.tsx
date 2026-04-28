"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { GroupPlaySession, PlaySessionParticipant } from "../types"

type ParticipantNextStatus = "WAITLIST" | "CONFIRMED" | "CANCELLED"

interface PlaySessionParticipantDetailProps {
  maxSlots: number | null
  participant: PlaySessionParticipant | null
  showCard?: boolean
  onCancel?: () => void
  onStatusChange?: (
    participant: PlaySessionParticipant,
    nextStatus: ParticipantNextStatus
  ) => void
}

export function PlaySessionParticipantDetail({
  participant,
  showCard = true,
  onCancel,
  onStatusChange,
}: PlaySessionParticipantDetailProps) {
  if (!participant) {
    return null
  }

  const displayName = participant.name || "Người chơi"
  const displayLevel = "Newbie / 2.0"
  const currentStatus = String(participant.status ?? "")
    .trim()
    .toUpperCase()

  const avatarFallback =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "N"

  const detailContent = (
    <>
      {/* detail participants header */}
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Chi tiết người tham gia</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* detail joined participants */}
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          {/* avatar */}
          <Avatar className="size-12 border">
            <AvatarImage
              src={participant.avatarUrl ?? undefined}
              alt={displayName}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          {/* name */}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              Trình độ: {displayLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Trạng thái:</span>
          <Badge variant="secondary">{currentStatus || "UNKNOWN"}</Badge>
        </div>

        {/* Các nút chuyển vị trí (CONFIRMED, WAITLIST) */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Put in WAITLIST */}
          <Button
            type="button"
            variant={currentStatus === "WAITLIST" ? "default" : "outline"}
            className={
              currentStatus === "WAITLIST"
                ? "bg-yellow-500 text-black hover:bg-yellow-500"
                : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            }
            onClick={() => onStatusChange?.(participant, "WAITLIST")}
          >
            Put In Waitlist
          </Button>

          {/* CONFIRMED */}
          <Button
            type="button"
            variant={currentStatus === "CONFIRMED" ? "default" : "outline"}
            className={
              currentStatus === "CONFIRMED"
                ? "bg-green-600 text-white hover:bg-green-600"
                : "border-green-600 text-green-700 hover:bg-green-50"
            }
            onClick={() => onStatusChange?.(participant, "CONFIRMED")}
          >
            Confirmed to play
          </Button>

          <Button
            type="button"
            variant={currentStatus === "CANCELLED" ? "default" : "outline"}
            className={
              currentStatus === "CANCELLED"
                ? "bg-slate-600 text-white hover:bg-slate-600"
                : "border-slate-400 text-slate-700 hover:bg-slate-50"
            }
            onClick={() => onStatusChange?.(participant, "CANCELLED")}
          >
            On hold
          </Button>
        </div>

        {onCancel ? (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Đóng
            </Button>
          </div>
        ) : null}
      </CardContent>
    </>
  )

  if (!showCard) {
    return <div className="w-full">{detailContent}</div>
  }

  return <Card className="w-full bg-transparent">{detailContent}</Card>
}
