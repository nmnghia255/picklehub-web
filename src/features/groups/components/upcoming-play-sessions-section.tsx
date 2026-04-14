"use client"

import { Clock, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ErrorSection } from "@/components/error-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { joinPlaySessionAction } from "@/features/play-sessions/actions/join-play-session"
import type { GroupPlaySession } from "@/features/play-sessions/types"

interface UpcomingPlaySessionsSectionProps {
  groupId: string
}

type PlaySessionsResponse =
  | GroupPlaySession[]
  | {
      data?: unknown
      sessions?: unknown
    }

type CurrentUserResponse = {
  id?: string
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

function hasUserJoined(session: GroupPlaySession, userId?: string): boolean {
  if (!userId) return false
  return (
    session.participants?.some(
      (p) => p.userId === userId && p.status === "JOINED"
    ) ?? false
  )
}

function normalizeSessionsPayload(
  payload: PlaySessionsResponse
): GroupPlaySession[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) {
      return payload.data as GroupPlaySession[]
    }

    if (
      payload.data &&
      typeof payload.data === "object" &&
      Array.isArray((payload.data as { data?: unknown }).data)
    ) {
      return (payload.data as { data: GroupPlaySession[] }).data
    }

    if (Array.isArray(payload.sessions)) {
      return payload.sessions as GroupPlaySession[]
    }
  }

  return []
}

export function UpcomingPlaySessionsSection({
  groupId,
}: UpcomingPlaySessionsSectionProps) {
  const pageSize = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<GroupPlaySession[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadData = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        const params = new URLSearchParams({
          contextType: "INTERNAL_GROUP",
          groupId,
          status: "SCHEDULED",
          order: "asc",
          limit: "50",
        })

        const [sessionsResponse, meResponse] = await Promise.all([
          fetch(`/api/play-sessions?${params.toString()}`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch("/api/auth/me", {
            credentials: "include",
            signal: controller.signal,
          }),
        ])

        if (!sessionsResponse.ok) {
          throw new Error("Failed to load play sessions")
        }

        const sessionsPayload =
          (await sessionsResponse.json()) as PlaySessionsResponse
        const now = new Date()
        const upcoming = normalizeSessionsPayload(sessionsPayload).filter(
          (session) => new Date(session.startTime) > now
        )
        setSessions(upcoming)

        if (meResponse.ok) {
          const me = (await meResponse.json()) as CurrentUserResponse
          setCurrentUserId(me.id)
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        console.error("Failed to load upcoming sessions:", error)
        setHasError(true)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      controller.abort()
    }
  }, [groupId])

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)

  const pagedSessions = useMemo(() => {
    const start = (effectivePage - 1) * pageSize
    return sessions.slice(start, start + pageSize)
  }, [sessions, effectivePage])

  const handleJoinSession = async (
    e: React.MouseEvent,
    session: GroupPlaySession
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session.groupId) {
      toast.error("Cannot join session without group information")
      return
    }

    try {
      setJoiningSessionId(session.id)
      const result = await joinPlaySessionAction(session.groupId, session.id)
      if (result.success) {
        toast.success("Tham gia buổi chơi thành công!")
        setSessions((prev) =>
          prev.map((item) => {
            if (item.id !== session.id) {
              return item
            }

            if (hasUserJoined(item, currentUserId)) {
              return item
            }

            return {
              ...item,
              joinedCount: (item.joinedCount ?? 0) + 1,
              participants: currentUserId
                ? [
                    ...(item.participants ?? []),
                    {
                      userId: currentUserId,
                      status: "JOINED",
                    },
                  ]
                : item.participants,
            }
          })
        )
      } else {
        toast.error(result.error || "Không thể tham gia buổi chơi")
      }
    } catch (error) {
      console.error("Failed to join session:", error)
      toast.error("Không thể tham gia buổi chơi")
    } finally {
      setJoiningSessionId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Buổi chơi sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <div className="mt-6">
        <ErrorSection message="Không thể tải danh sách buổi chơi sắp tới." />
      </div>
    )
  }

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
                <Button
                  size="sm"
                  onClick={(e) => handleJoinSession(e, session)}
                  disabled={
                    joiningSessionId === session.id ||
                    hasUserJoined(session, currentUserId)
                  }
                  className="shrink-0"
                >
                  {joiningSessionId === session.id
                    ? "Đang tham gia..."
                    : hasUserJoined(session, currentUserId)
                      ? "Đã tham gia"
                      : "Tham gia"}
                </Button>
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
