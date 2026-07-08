"use client"

import { useTranslation } from "react-i18next"

import { CoachPageHeader } from "@/features/coach/components/coach-page-header"
import { CoachStudentsTable } from "@/features/coach/components/coach-students-table"

export default function CoachStudentsPage() {
  const { t } = useTranslation("common")
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title={t("coach.pageHeader.students.title")}
          description={t("coach.pageHeader.students.description")}
        />

        <CoachStudentsTable />
      </div>
    </div>
  )
}
