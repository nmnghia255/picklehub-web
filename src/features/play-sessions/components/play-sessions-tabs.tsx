"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GroupPlaySession } from "@/features/play-sessions/api/public-play-sessions-service"

import { SessionsList } from "./sessions-list"

interface PlaySessionsTabsProps {
  mySessions: GroupPlaySession[]
  publicSessions: GroupPlaySession[]
}

export function PlaySessionsTabs({
  mySessions,
  publicSessions,
}: PlaySessionsTabsProps) {
  return (
    <Tabs defaultValue="my-sessions" className="gap-6">
      <TabsList>
        <TabsTrigger value="my-sessions">Buổi chơi của bạn</TabsTrigger>
        <TabsTrigger value="public-sessions">Buổi chơi cộng đồng</TabsTrigger>
      </TabsList>

      <TabsContent value="my-sessions">
        <SessionsList sessions={mySessions} defaultDateTimeFilter="future" />
      </TabsContent>

      <TabsContent value="public-sessions">
        <SessionsList sessions={publicSessions} defaultDateTimeFilter="all" />
      </TabsContent>
    </Tabs>
  )
}
