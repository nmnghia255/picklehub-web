"use client"

import { Clock, Users } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { ErrorSection } from "@/components/error-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/types"

function normalizeStatus(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Đã xuất bản"
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

export function UpcomingPlaySessionsSection({
  sessions,
  hasError,
}: {
  sessions: GroupPlaySession[]
  hasError?: boolean
}) {
  const pageSize = 10
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)

  const pagedSessions = useMemo(() => {
    const start = (effectivePage - 1) * pageSize
    return sessions.slice(start, start + pageSize)
  }, [sessions, effectivePage])

  if (hasError) {
    return (
      <div className="mt-6">
        <ErrorSection message="Không thể tải danh sách buổi chơi sắp tới." />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Buổi chơi sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <p className="text-center text-muted-foreground">
              Chưa có buổi chơi nào được lên lịch.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Buổi chơi sắp tới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pagedSessions.map((session) => (
            <Link
              key={session.id}
              href={
                session.groupId
                  ? `/play-sessions/${session.id}?groupId=${session.groupId}`
                  : `/play-sessions/${session.id}`
              }
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-4">
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
                        {new Date(session.startTime).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
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
                      {normalizeStatus(session.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Trang {effectivePage}/{totalPages} ({sessions.length} buổi chơi)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePage === 1}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(1, Math.min(prev, totalPages) - 1)
                  )
                }
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, Math.min(prev, totalPages) + 1)
                  )
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
