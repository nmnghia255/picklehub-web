"use client"

import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { CoachDiscoveryPage } from "@/features/coach/components/pages/coach-discovery-page-content"

export default function CoachesPage() {
  const { t } = useTranslation("common")
  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("coach.discovery.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("coach.discovery.pageDescription")}
        </p>
      </div>
      <CoachDiscoveryPage />
    </PageContainer>
  )
}
