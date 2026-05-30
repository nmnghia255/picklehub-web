"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type GroupDetailTabValue =
  | "overview"
  | "sessions"
  | "activity"
  | "finance"
  | "chat"

const GroupDetailTabContext = createContext<GroupDetailTabValue>("overview")

export function useGroupDetailActiveTab() {
  return useContext(GroupDetailTabContext)
}

interface GroupDetailTabsProps {
  overview: ReactNode
  sessions: ReactNode
  activity: ReactNode
  finance: ReactNode
  chat: ReactNode
  defaultValue?: GroupDetailTabValue
}

export function GroupDetailTabs({
  overview,
  sessions,
  activity,
  finance,
  chat,
  defaultValue = "overview",
}: GroupDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<GroupDetailTabValue>(defaultValue)

  useEffect(() => {
    setActiveTab(defaultValue)
  }, [defaultValue])

  return (
    <GroupDetailTabContext.Provider value={activeTab}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GroupDetailTabValue)}
        className="w-full gap-6"
      >
        <TabsList
          variant="line"
          className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1"
        >
          <TabsTrigger value="overview" className="sm:flex-none">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="sessions" className="sm:flex-none">
            Buổi chơi
          </TabsTrigger>
          <TabsTrigger value="activity" className="sm:flex-none">
            Lịch hoạt động
          </TabsTrigger>
          <TabsTrigger value="finance" className="sm:flex-none">
            Thu chi
          </TabsTrigger>
          <TabsTrigger value="chat" className="sm:flex-none">
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 w-full min-w-0">
          {overview}
        </TabsContent>
        <TabsContent value="sessions" className="mt-6 w-full min-w-0">
          {sessions}
        </TabsContent>
        <TabsContent value="activity" className="mt-6 w-full min-w-0">
          {activity}
        </TabsContent>
        <TabsContent value="finance" className="mt-6 w-full min-w-0">
          {finance}
        </TabsContent>
        <TabsContent value="chat" className="mt-6 w-full min-w-0">
          {chat}
        </TabsContent>
      </Tabs>
    </GroupDetailTabContext.Provider>
  )
}
