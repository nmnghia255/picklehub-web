"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LearnerCoachDiscovery } from "@/features/learner/components/learner-coach-discovery"
import { LearnerOverview } from "@/features/learner/components/learner-overview"
import { LearnerPayments } from "@/features/learner/components/learner-payments"
import { LearnerProfile } from "@/features/learner/components/learner-profile"
import { LearnerSchedule } from "@/features/learner/components/learner-schedule"

export type LearnerTabValue =
  | "overview"
  | "profile"
  | "schedule"
  | "payments"
  | "discovery"

export function LearnerDetailTabs() {
  const [activeTab, setActiveTab] = useState<LearnerTabValue>("overview")

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as LearnerTabValue)}
      className="w-full gap-6"
    >
      <TabsList
        variant="line"
        className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1"
      >
        <TabsTrigger value="overview" className="sm:flex-none">
          Tổng quan
        </TabsTrigger>
        <TabsTrigger value="profile" className="sm:flex-none">
          Hồ sơ
        </TabsTrigger>
        <TabsTrigger value="schedule" className="sm:flex-none">
          Lịch tập
        </TabsTrigger>
        <TabsTrigger value="payments" className="sm:flex-none">
          Thanh toán
        </TabsTrigger>
        <TabsTrigger value="discovery" className="sm:flex-none">
          Khám phá & Đăng ký HLV
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 w-full min-w-0">
        <LearnerOverview />
      </TabsContent>

      <TabsContent value="profile" className="mt-6 w-full min-w-0">
        <LearnerProfile />
      </TabsContent>

      <TabsContent value="schedule" className="mt-6 w-full min-w-0">
        <LearnerSchedule />
      </TabsContent>

      <TabsContent value="payments" className="mt-6 w-full min-w-0">
        <LearnerPayments />
      </TabsContent>

      <TabsContent value="discovery" className="mt-6 w-full min-w-0">
        <LearnerCoachDiscovery />
      </TabsContent>
    </Tabs>
  )
}
