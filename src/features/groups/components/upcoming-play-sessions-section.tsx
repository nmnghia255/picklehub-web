import { Clock, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/api/group-play-sessions-service"

interface UpcomingPlaySessionsSectionProps {
  sessions: GroupPlaySession[]
}

export function UpcomingPlaySessionsSection({
  sessions,
}: UpcomingPlaySessionsSectionProps) {
  if (sessions.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Buổi chơi sắp tới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={
                session.groupId
                  ? `/play-sessions/${session.id}?groupId=${session.groupId}`
                  : `/play-sessions/${session.id}`
              }
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{session.title}</h3>
                {session.description && (
                  <p className="text-sm text-muted-foreground">
                    {session.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>
                      {new Date(session.startTime).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {session.maxSlots && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="size-4" />
                      <span>
                        {session.joinedCount || 0}/{session.maxSlots}
                      </span>
                    </div>
                  )}
                  <Badge variant="outline">
                    {session.status === "SCHEDULED"
                      ? "Lên lịch"
                      : session.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
