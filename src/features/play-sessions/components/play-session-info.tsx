import { CalendarDays, Clock3, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/types"
import {
  formatDateTime,
  getDateOnly,
  normalizeStatus,
} from "@/utils/time-helper"

interface PlaySessionInfoProps {
  session: GroupPlaySession
  participantCount: number
}

export function PlaySessionInfo({
  session,
  participantCount,
}: PlaySessionInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Thông tin</span>
          <Badge variant="outline">{normalizeStatus(session.status)}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-muted-foreground">{session.description}</p>
        )}

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <span>Ngày: {getDateOnly(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-4" />
            <span>
              Thời gian: {formatDateTime(session.startTime)} -{" "}
              {formatDateTime(session.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4" />
            <span>
              Số người tham gia: {session.joinedCount ?? participantCount}
              {session.maxSlots ? ` / ${session.maxSlots}` : ""}
            </span>
          </div>
          <div>
            <span>ID người tạo: {session.creatorId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
