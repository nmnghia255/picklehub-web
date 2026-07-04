"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoachDashboardStats } from "@/features/coach/components/coach-dashboard-stats"
import { CoachIncomeOverview } from "@/features/coach/components/coach-income-overview"
import { CoachLearnerDetailPanel } from "@/features/coach/components/coach-learner-detail-panel"
import { CoachProfileForm } from "@/features/coach/components/coach-profile-form"
import { CoachStudentsTable } from "@/features/coach/components/coach-students-table"
import { CoachWeekSchedule } from "@/features/coach/components/coach-week-schedule"

import { CoachBookingsPanel } from "./coach-bookings-panel"
import { CoachClassesPanel } from "./coach-classes-panel"
import { CoachReviews } from "./coach-reviews"

export type CoachTabValue =
  | "overview"
  | "profile"
  | "students"
  | "schedule"
  | "classes"
  | "bookings"
  | "finance"
  | "reviews"

function CoachDetailTabsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabFromUrl = searchParams.get("tab") as CoachTabValue | null
  const [activeTab, setActiveTab] = useState<CoachTabValue>(tabFromUrl ?? "overview")
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null)

  // Sync tab from URL on mount / URL change
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
    // Only run when URL tab param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl])

  const handleTabChange = (value: string) => {
    const tab = value as CoachTabValue
    setActiveTab(tab)
    // Sync to URL so navigation from child pages can land on the correct tab.
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/coach?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
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
          Hồ sơ HLV
        </TabsTrigger>
        <TabsTrigger value="classes" className="sm:flex-none">
          Lớp học
        </TabsTrigger>
        <TabsTrigger value="bookings" className="sm:flex-none">
          Đặt lịch
        </TabsTrigger>
        <TabsTrigger value="students" className="sm:flex-none">
          Quản lý học viên
        </TabsTrigger>
        <TabsTrigger value="schedule" className="sm:flex-none">
          Lịch tập
        </TabsTrigger>
        <TabsTrigger value="finance" className="sm:flex-none">
          Thu chi & thanh toán
        </TabsTrigger>
        <TabsTrigger value="reviews" className="sm:flex-none">
          Đánh giá & Giới thiệu
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 w-full min-w-0">
        <CoachDashboardStats />
      </TabsContent>

      <TabsContent value="profile" className="mt-6 w-full min-w-0">
        <CoachProfileForm />
      </TabsContent>

      <TabsContent value="classes" className="mt-6 w-full min-w-0">
        <CoachClassesPanel />
      </TabsContent>

      <TabsContent value="bookings" className="mt-6 w-full min-w-0">
        <CoachBookingsPanel />
      </TabsContent>

      <TabsContent value="students" className="mt-6 w-full min-w-0">
        {selectedLearnerId ? (
          <CoachLearnerDetailPanel
            learnerId={selectedLearnerId}
            onBack={() => setSelectedLearnerId(null)}
          />
        ) : (
          <CoachStudentsTable onSelect={setSelectedLearnerId} />
        )}
      </TabsContent>

      <TabsContent value="schedule" className="mt-6 w-full min-w-0">
        <CoachWeekSchedule />
      </TabsContent>

      <TabsContent value="finance" className="mt-6 w-full min-w-0">
        <CoachIncomeOverview />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 w-full min-w-0">
        <CoachReviews />
      </TabsContent>
    </Tabs>
  )
}

export function CoachDetailTabs() {
  return (
    <Suspense fallback={null}>
      <CoachDetailTabsInner />
    </Suspense>
  )
}
