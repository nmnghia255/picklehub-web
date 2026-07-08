"use client"

import { Suspense } from "react"
import { useTranslation } from "react-i18next"

import { CoachIncomeOverview } from "@/features/coach/components/coach-income-overview"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"

export default function CoachIncomePage() {
  const { t } = useTranslation("common")
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title={t("coach.pageHeader.income.title")}
          description={t("coach.pageHeader.income.description")}
        />

        <Suspense fallback={null}>
          <CoachIncomeOverview />
        </Suspense>
      </div>
    </div>
  )
}
