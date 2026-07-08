"use client"

import { useTranslation } from "react-i18next"

import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachWeekSchedule } from "@/features/coach/components/coach-week-schedule"

export default function CoachSchedulePage() {
  const { t } = useTranslation("common")
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title={t("coach.pageHeader.schedule.title")}
          description={t("coach.pageHeader.schedule.description")}
        />

        <CoachWeekSchedule />
      </div>
    </div>
  )
}
