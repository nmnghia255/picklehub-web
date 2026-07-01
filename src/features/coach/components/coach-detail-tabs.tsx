"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoachDashboardStats } from "@/features/coach/components/coach-dashboard-stats"
import { CoachIncomeOverview } from "@/features/coach/components/coach-income-overview"
import { CoachProfileForm } from "@/features/coach/components/coach-profile-form"
import { CoachStudentsTable } from "@/features/coach/components/coach-students-table"
import { CoachWeekSchedule } from "@/features/coach/components/coach-week-schedule"

import { CoachBookingsPanel } from "./coach-bookings-panel"
import { CoachClassesPanel } from "./coach-classes-panel"
import { CoachRecommendation } from "./coach-recommendation"
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

export function CoachDetailTabs() {
  const [activeTab, setActiveTab] = useState<CoachTabValue>("overview")

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as CoachTabValue)}
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
        <CoachStudentsTable />
      </TabsContent>

      <TabsContent value="schedule" className="mt-6 w-full min-w-0">
        <CoachWeekSchedule />
      </TabsContent>

      <TabsContent value="finance" className="mt-6 w-full min-w-0">
        <CoachIncomeOverview />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 w-full min-w-0">
        <div className="space-y-8">
          <CoachReviews />
          <CoachRecommendation />
        </div>
      </TabsContent>
    </Tabs>
  )
}
