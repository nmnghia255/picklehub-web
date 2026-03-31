import { CalendarDays, Clock3, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/types"

import { normalizeStatus } from "./play-session-utils"

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
        <CardTitle>Thông tin buổi chơi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.description && (
          <p className="text-sm text-muted-foreground">{session.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="uppercase">
            {normalizeStatus(session.status)}
          </Badge>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <span>
              Bắt đầu: {new Date(session.startTime).toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-4" />
            <span>
              Kết thúc: {new Date(session.endTime).toLocaleString("vi-VN")}
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
          <div>
            <span>
              Tạo lúc: {new Date(session.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <div>
            <span>
              Cập nhật: {new Date(session.updatedAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
