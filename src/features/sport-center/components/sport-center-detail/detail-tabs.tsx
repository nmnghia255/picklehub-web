"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface DetailTabsProps {
  introductionTab: ReactNode
  serviceTab: ReactNode
  imagesTab: ReactNode
  policyTab: ReactNode
  feedbackTab: ReactNode
}

export function DetailTabs({
  introductionTab,
  serviceTab,
  imagesTab,
  policyTab,
  feedbackTab,
}: DetailTabsProps) {
  const { t } = useSportCenterTranslation()

  return (
    <Tabs defaultValue="introduction" className="w-full">
      <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
        <TabsTrigger value="introduction">
          {t("detail.tabs.introduction")}
        </TabsTrigger>
        <TabsTrigger value="service">{t("detail.tabs.service")}</TabsTrigger>
        <TabsTrigger value="images">{t("detail.tabs.images")}</TabsTrigger>
        <TabsTrigger value="policy">{t("detail.tabs.policy")}</TabsTrigger>
        <TabsTrigger value="feedback">{t("detail.tabs.feedback")}</TabsTrigger>
      </TabsList>

      <TabsContent value="introduction">{introductionTab}</TabsContent>

      <TabsContent value="service">{serviceTab}</TabsContent>

      <TabsContent value="images">{imagesTab}</TabsContent>

      <TabsContent value="policy">{policyTab}</TabsContent>

      <TabsContent value="feedback">{feedbackTab}</TabsContent>
    </Tabs>
  )
}
