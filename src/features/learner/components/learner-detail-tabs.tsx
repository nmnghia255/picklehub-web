"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LearnerAiSupportPanel } from "@/features/learner/components/learner-ai-support-panel"
import { LearnerBookingsPanel } from "@/features/learner/components/learner-bookings-panel"
import { LearnerCoachDiscovery } from "@/features/learner/components/learner-coach-discovery"
import { LearnerEnrollmentsPanel } from "@/features/learner/components/learner-enrollments-panel"
import { LearnerSchedule } from "@/features/learner/components/learner-schedule"

export type LearnerTabValue =
  | "schedule"
  | "enrollments"
  | "bookings"
  | "discovery"
  | "aiSupport"

export function LearnerDetailTabs() {
  const { t } = useTranslation("common")
  const [activeTab, setActiveTab] = useState<LearnerTabValue>("schedule")

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
        <TabsTrigger value="schedule" className="sm:flex-none">
          {t("learner.tabs.schedule")}
        </TabsTrigger>
        <TabsTrigger value="enrollments" className="sm:flex-none">
          {t("learner.tabs.enrollments")}
        </TabsTrigger>
        <TabsTrigger value="bookings" className="sm:flex-none">
          {t("learner.tabs.bookings")}
        </TabsTrigger>
        <TabsTrigger value="discovery" className="sm:flex-none">
          {t("learner.tabs.discovery")}
        </TabsTrigger>
        <TabsTrigger value="aiSupport" className="sm:flex-none">
          {t("learner.tabs.aiSupport")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="schedule" className="mt-6 w-full min-w-0">
        <LearnerSchedule />
      </TabsContent>

      <TabsContent value="enrollments" className="mt-6 w-full min-w-0">
        <LearnerEnrollmentsPanel />
      </TabsContent>

      <TabsContent value="bookings" className="mt-6 w-full min-w-0">
        <LearnerBookingsPanel />
      </TabsContent>

      <TabsContent value="discovery" className="mt-6 w-full min-w-0">
        <LearnerCoachDiscovery />
      </TabsContent>

      <TabsContent value="aiSupport" className="mt-6 w-full min-w-0">
        <LearnerAiSupportPanel />
      </TabsContent>
    </Tabs>
  )
}
