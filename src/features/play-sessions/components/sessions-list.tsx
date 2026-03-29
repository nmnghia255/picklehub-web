"use client"

import { useMemo, useState } from "react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import type { GroupPlaySession } from "@/features/play-sessions/api/public-play-sessions-service"

import { PlaySessionCard } from "./play-session-card"
import type { DateTimeFilter, SessionStatusFilter } from "./sessions-filter-bar"
import SessionsFilterBar from "./sessions-filter-bar"

interface SessionsListProps {
  sessions: GroupPlaySession[]
  defaultDateTimeFilter?: DateTimeFilter
}

function isSameDay(target: Date, now: Date) {
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  )
}

export function SessionsList({
  sessions,
  defaultDateTimeFilter = "future",
}: SessionsListProps) {
  const [nameKeyword, setNameKeyword] = useState("")
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>(
    defaultDateTimeFilter
  )
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>("ALL")

  const safeSessions = Array.isArray(sessions) ? sessions : []

  const filteredSessions = useMemo(() => {
    const keyword = nameKeyword.trim().toLowerCase()
    const now = new Date()

    return safeSessions.filter((session) => {
      const sessionStart = new Date(session.startTime)
      const matchName = session.title.toLowerCase().includes(keyword)
      const matchStatus =
        statusFilter === "ALL" || session.status === statusFilter

      let matchDateTime = true
      if (dateTimeFilter === "future") {
        matchDateTime = sessionStart > now
      } else if (dateTimeFilter === "today") {
        matchDateTime = isSameDay(sessionStart, now)
      } else if (dateTimeFilter === "past") {
        matchDateTime = sessionStart < now
      }

      return matchName && matchDateTime && matchStatus
    })
  }, [safeSessions, nameKeyword, dateTimeFilter, statusFilter])

  return (
    <div className="space-y-4">
      <SessionsFilterBar
        nameKeyword={nameKeyword}
        statusFilter={statusFilter}
        onNameKeywordChange={setNameKeyword}
        onStatusFilterChange={setStatusFilter}
      />

      {filteredSessions.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>Không tìm thấy buổi chơi nào</EmptyTitle>
            <EmptyDescription>
              Không tìm thấy buổi chơi nào. Thử thay đổi bộ lọc để tìm các buổi
              chơi phù hợp.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredSessions
            .slice()
            .sort(
              (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
            )
            .map((session) => (
              <PlaySessionCard key={session.id} session={session} />
            ))}
        </div>
      )}
    </div>
  )
}
