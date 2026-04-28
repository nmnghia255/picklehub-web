import { CalendarDays, Clock, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/types"
import {
  formatDateTime,
  getDateOnly,
  normalizeStatus,
} from "@/utils/time-helper"

interface PlaySessionCardProps {
  session: GroupPlaySession
}

function getUserParticipationStatus(
  session: GroupPlaySession
): "joined" | "waitlist" | "host" | "not_joined" {
  // Check if user is the host
  if (session.isHost) {
    return "host"
  }

  // Check if user has confirmed participation status
  if (
    session.myParticipationStatus &&
    session.myParticipationStatus !== "none"
  ) {
    return "joined"
  }

  return "not_joined"
}

export function isSameDay(dateTimeStr1: string, dateTimeStr2: string) {
  return getDateOnly(dateTimeStr1) === getDateOnly(dateTimeStr2)
}

export function PlaySessionCard({ session }: PlaySessionCardProps) {
  const userParticipationStatus = getUserParticipationStatus(session)
  const detailHref =
    session.type === "INTERNAL_GROUP"
      ? session.groupId
        ? `/groups/${session.groupId}/${session.id}`
        : null
      : `/play-sessions/${session.id}`

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="line-clamp-1">{session.title}</CardTitle>
        {userParticipationStatus &&
          // <Badge
          //   variant={
          //     userParticipationStatus === "joined"
          //       ? "default"
          //       : userParticipationStatus === "host"
          //         ? "default"
          //         : userParticipationStatus === "not_joined"
          //           ? "secondary"
          //           : "outline"
          //   }
          //   className="shrink-0 p-1.5 text-xs"
          // >
          //   {userParticipationStatus === "joined"
          //     ? "Đã tham gia"
          //     : userParticipationStatus === "host"
          //       ? "Người tổ chức"
          //       : userParticipationStatus === "not_joined"
          //         ? "Chưa tham gia"
          //         : "Chờ xác nhận"}
          // </Badge>
          (() => {
            const STATUS_LABELS: Record<
              "joined" | "waitlist" | "host" | "not_joined",
              string
            > = {
              host: "Người tổ chức",
              joined: "Người tham gia",
              waitlist: "Chờ xác nhận",
              not_joined: "Chưa tham gia",
            }

            const STATUS_STYLES: Record<
              "joined" | "waitlist" | "host" | "not_joined",
              string
            > = {
              host: "bg-purple-600 text-white",
              joined: "bg-green-600 text-white",
              waitlist: "bg-yellow-400 text-black",
              not_joined: "bg-sky-100 text-sky-800",
            }

            const label = STATUS_LABELS[userParticipationStatus]
            const style = STATUS_STYLES[userParticipationStatus]

            return (
              <Badge className={`shrink-0 p-1.5 text-xs ${style}`}>
                {label}
              </Badge>
            )
          })()}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {/* Note */}
        {session.note && (
          <p className="line-clamp-2 text-muted-foreground">{session.note}</p>
        )}

        {/* Date */}
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>{getDateOnly(session.startTime)}</span>
        </div>

        {/* Time */}
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Clock className="size-4" />
          <span>
            {formatDateTime(session.startTime)} -{" "}
            {formatDateTime(session.endTime)}
          </span>
        </div>

        {/* Participant Count */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span className="font-medium">
            {session.joinedCount}/{session.maxSlots}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary" className="uppercase">
            {normalizeStatus(session.status)}
          </Badge>
          {detailHref ? (
            <Button variant="outline" asChild>
              <Link href={detailHref}>Xem chi tiết</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Không có chi tiết
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
