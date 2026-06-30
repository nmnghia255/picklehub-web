"use client"

import { useMemo, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoachDashboardStats } from "@/features/coach/components/coach-dashboard-stats"
import { CoachIncomeOverview } from "@/features/coach/components/coach-income-overview"
import { CoachProfileForm } from "@/features/coach/components/coach-profile-form"
import { CoachStudentsTable } from "@/features/coach/components/coach-students-table"
import { CoachWeekSchedule } from "@/features/coach/components/coach-week-schedule"
import { getCoachStudents } from "@/features/coach/data/coach-learner-relationship"
import { students } from "@/features/coach/data/mockStudents"

import { CoachRecommendation } from "./coach-recommendation"
import { CoachReviews } from "./coach-reviews"

const CURRENT_COACH_ID = "c1"

export type CoachTabValue =
  | "overview"
  | "profile"
  | "students"
  | "schedule"
  | "finance"
  | "reviews"

export function CoachDetailTabs() {
  const [activeTab, setActiveTab] = useState<CoachTabValue>("overview")

  const coachStudents = useMemo(() => {
    const coachStudentIds = getCoachStudents(CURRENT_COACH_ID).map((s) => s.id)
    return students.filter((s) => coachStudentIds.includes(s.id))
  }, [])

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

      <TabsContent value="students" className="mt-6 w-full min-w-0">
        <CoachStudentsTable students={coachStudents} />
      </TabsContent>

      <TabsContent value="schedule" className="mt-6 w-full min-w-0">
        <CoachWeekSchedule />
      </TabsContent>

      <TabsContent value="finance" className="mt-6 w-full min-w-0">
        <CoachIncomeOverview />
      </TabsContent>

      <TabsContent value="reviews" className="mt-6 w-full min-w-0">
        <div className="space-y-8">
          <CoachReviews coachId={CURRENT_COACH_ID} />
          <CoachRecommendation />
        </div>
      </TabsContent>
    </Tabs>
  )
}
