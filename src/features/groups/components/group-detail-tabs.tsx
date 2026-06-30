"use client"

import { createContext, type ReactNode, useContext, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type GroupDetailTabValue =
  | "overview"
  | "activity"
  | "finance"
  | "court-bookings"
  | "equipment"
  | "guest-members"

const GroupDetailTabContext = createContext<GroupDetailTabValue>("overview")

export function useGroupDetailActiveTab() {
  return useContext(GroupDetailTabContext)
}

interface GroupDetailTabsProps {
  overview: ReactNode
  activity: ReactNode
  finance: ReactNode
  courtBookings: ReactNode
  equipment: ReactNode
  guestMembers: ReactNode
  defaultValue?: GroupDetailTabValue
}

export function GroupDetailTabs({
  overview,
  activity,
  finance,
  courtBookings,
  equipment,
  guestMembers,
  defaultValue = "overview",
}: GroupDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<GroupDetailTabValue>(defaultValue)

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
          <TabsTrigger value="activity" className="sm:flex-none">
            Lịch hoạt động
          </TabsTrigger>
          <TabsTrigger value="court-bookings" className="sm:flex-none">
            Đặt sân nhóm
          </TabsTrigger>
          <TabsTrigger value="finance" className="sm:flex-none">
            Thu chi
          </TabsTrigger>
          <TabsTrigger value="equipment" className="sm:flex-none">
            Vật dụng
          </TabsTrigger>
          <TabsTrigger value="guest-members" className="sm:flex-none">
            Người vãng lai
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 w-full min-w-0">
          {overview}
        </TabsContent>
        <TabsContent value="activity" className="mt-6 w-full min-w-0">
          {activity}
        </TabsContent>
        <TabsContent value="court-bookings" className="mt-6 w-full min-w-0">
          {courtBookings}
        </TabsContent>
        <TabsContent value="finance" className="mt-6 w-full min-w-0">
          {finance}
        </TabsContent>
        <TabsContent value="equipment" className="mt-6 w-full min-w-0">
          {equipment}
        </TabsContent>
        <TabsContent value="guest-members" className="mt-6 w-full min-w-0">
          {guestMembers}
        </TabsContent>
      </Tabs>
    </GroupDetailTabContext.Provider>
  )
}
