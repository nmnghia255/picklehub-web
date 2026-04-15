"use client"

import { useMemo, useState } from "react"

import { ErrorSection } from "@/components/error-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlaySessionCard } from "@/features/play-sessions/components/play-session-card"
import type { GroupPlaySession } from "@/features/play-sessions/types"

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
        <div className="space-y-4">
          {pagedSessions.map((session) => (
            <PlaySessionCard key={session.id} session={session} />
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
