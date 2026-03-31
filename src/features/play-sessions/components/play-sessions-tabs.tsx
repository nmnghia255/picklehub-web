"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GroupPlaySession } from "@/features/play-sessions/api/public-play-sessions-service"

import { SessionSearchInput } from "./session-search-input"
import SessionsFilterBar, {
  type SessionStatusFilter,
} from "./sessions-filter-bar"
import { PlaySessionsList } from "./sessions-list"

interface PlaySessionsTabsProps {
  mySessions: GroupPlaySession[]
  publicSessions: GroupPlaySession[]
}

export function PlaySessionsTabs({
  mySessions,
  publicSessions,
}: PlaySessionsTabsProps) {
  const [mySessionsKeyword, setMySessionsKeyword] = useState("")
  const [publicSessionsKeyword, setPublicSessionsKeyword] = useState("")
  const [mySessionsStatusFilter, setMySessionsStatusFilter] =
    useState<SessionStatusFilter>("ALL")
  const [publicSessionsStatusFilter, setPublicSessionsStatusFilter] =
    useState<SessionStatusFilter>("ALL")

  return (
    <Tabs defaultValue="my-sessions" className="gap-6">
      <div className="flex justify-center">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="my-sessions">Buổi chơi của bạn</TabsTrigger>
          <TabsTrigger value="public-sessions">Buổi chơi cộng đồng</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="my-sessions" className="space-y-4">
        <div className="flex gap-3">
          <SessionSearchInput
            placeholder="Tìm kiếm"
            value={mySessionsKeyword}
            onChange={setMySessionsKeyword}
            ariaLabel="Tìm kiếm"
          />
          <SessionsFilterBar
            statusFilter={mySessionsStatusFilter}
            onStatusFilterChange={setMySessionsStatusFilter}
          />
        </div>
        <PlaySessionsList
          sessions={mySessions}
          defaultDateTimeFilter="future"
          nameKeyword={mySessionsKeyword}
          statusFilter={mySessionsStatusFilter}
        />
      </TabsContent>

      <TabsContent value="public-sessions" className="space-y-4">
        <div className="flex gap-3">
          <SessionSearchInput
            placeholder="Tìm kiếm"
            value={publicSessionsKeyword}
            onChange={setPublicSessionsKeyword}
            ariaLabel="Tìm kiếm"
          />
          <SessionsFilterBar
            statusFilter={publicSessionsStatusFilter}
            onStatusFilterChange={setPublicSessionsStatusFilter}
          />
        </div>
        <PlaySessionsList
          sessions={publicSessions}
          defaultDateTimeFilter="all"
          nameKeyword={publicSessionsKeyword}
          statusFilter={publicSessionsStatusFilter}
        />
      </TabsContent>
    </Tabs>
  )
}
