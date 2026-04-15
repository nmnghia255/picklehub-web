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

export function isSameDay(dateTimeStr1: string, dateTimeStr2: string) {
  return getDateOnly(dateTimeStr1) === getDateOnly(dateTimeStr2)
}

export function PlaySessionCard({ session }: PlaySessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{session.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {session.description && (
          <p className="line-clamp-2 text-muted-foreground">
            {session.description}
          </p>
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

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="uppercase">
            {normalizeStatus(session.status)}
          </Badge>
          <Button variant="outline" asChild>
            <Link
              href={
                session.groupId
                  ? `/groups/${session.groupId}/${session.id}`
                  : `/play-sessions/${session.id}`
              }
            >
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
