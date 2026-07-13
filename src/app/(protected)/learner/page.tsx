"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { LearnerDetailTabs } from "@/features/learner/components/learner-detail-tabs"

export default function LearnerPage() {
  const { t } = useTranslation("common")

  useEffect(() => {
    document.title = t("learner.pageTitle")
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    )
    if (meta) meta.content = t("learner.pageDescription")
  }, [t])

  return (
    <PageContainer variant="wide" className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("learner.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("learner.pageDescription")}
        </p>
      </div>

      <LearnerDetailTabs />
    </PageContainer>
  )
}
