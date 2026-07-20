"use client"

import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui/card"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"

export default function StudentDetailPage() {
  const { t } = useTranslation("common")
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <CoachPageHeader
          title={t("coach.pageHeader.studentDetail.title")}
          description={t("coach.pageHeader.studentDetail.description")}
          backTo="/coach?tab=students"
        />

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("coach.students.learnerDetail.notFound")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
