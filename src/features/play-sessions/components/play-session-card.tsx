import { CalendarDays } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/api/public-play-sessions-service"

interface PlaySessionCardProps {
  session: GroupPlaySession
}

function normalizeStatus(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "Lên lịch"
    case "IN_PROGRESS":
      return "Đang diễn ra"
    case "COMPLETED":
      return "Hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
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

        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>
            {new Date(session.startTime).toLocaleString("vi-VN")} -{" "}
            {new Date(session.endTime).toLocaleString("vi-VN")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="uppercase">
            {normalizeStatus(session.status)}
          </Badge>
          <Button variant="outline" asChild>
            <Link href={`/play-sessions/${session.id}`}>Xem chi tiết</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
