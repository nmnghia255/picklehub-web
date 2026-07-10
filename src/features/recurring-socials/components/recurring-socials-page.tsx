"use client"

import { Plus } from "lucide-react"
import React, { useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

import { MOCK_RECURRING_SOCIALS } from "../recurring-socials.mock"
import type {
  RecurringSocialFormData,
  RecurringSocialTemplate,
  SchedulePreview,
} from "../recurring-socials.types"
import {
  getLocalizedText,
  getSocialTypeLabel,
  getStatusLabel,
} from "../recurring-socials.utils"
import { RecurringSocialsForm } from "./recurring-socials-form"
import { RecurringSocialsList } from "./recurring-socials-list"

export function RecurringSocialsPage() {
  const [activeTab, setActiveTab] = useState<"create" | "list">("list")
  const [socials, setSocials] = useState<RecurringSocialTemplate[]>(
    MOCK_RECURRING_SOCIALS
  )
  const { toast } = useToast()
  const { t } = useRecurringSocialsTranslation()

  const handleCreateSocial = (
    data: RecurringSocialFormData & { schedulePreview?: SchedulePreview[] }
  ) => {
    const newSocial: RecurringSocialTemplate = {
      id: `rs-${Date.now()}`,
      name: data.name,
      description: data.description,
      socialType: data.socialType,
      skillLevel: data.skillLevel,
      startTime: data.startTime,
      endTime: data.endTime,
      courts: data.selectedCourts,
      maxParticipants: data.maxParticipants,
      maxPerCourt: data.maxPerCourt,
      maxWaitlist: data.maxWaitlist,
      fee: data.fee,
      courtRentFee: data.courtRentFee,
      costNote: data.costNote,
      recurrenceType: data.recurrenceType,
      daysOfWeek: data.daysOfWeek,
      dayOfMonth: data.dayOfMonth,
      quarterDay: data.quarterDay,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSocials([newSocial, ...socials])
    setActiveTab("list")

    toast({
      title: t("recurringSocials.toast.successTitle"),
      description: t("recurringSocials.toast.created", {
        count: data.schedulePreview?.length || 0,
      }),
    })
  }

  const handlePauseSocial = (id: string) => {
    const social = socials.find((s) => s.id === id)
    const willPause = social?.status === "active"

    setSocials(
      socials.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "paused" : "active" }
          : s
      )
    )

    toast({
      title: t("recurringSocials.toast.successTitle"),
      description: t("recurringSocials.toast.paused", {
        action: willPause
          ? t("recurringSocials.list.actions.pause")
          : t("recurringSocials.list.actions.activate"),
        name: getLocalizedText(social?.name ?? "", t, social?.nameKey),
      }),
    })
  }

  const handleDeleteSocial = (id: string) => {
    const social = socials.find((s) => s.id === id)
    setSocials(socials.filter((s) => s.id !== id))

    toast({
      title: t("recurringSocials.toast.successTitle"),
      description: t("recurringSocials.toast.deleted", {
        name: getLocalizedText(social?.name ?? "", t, social?.nameKey),
      }),
      variant: "destructive",
    })
  }

  const handleEditSocial = () => {
    toast({
      title: t("recurringSocials.toast.infoTitle"),
      description: t("recurringSocials.toast.editSoon"),
    })
  }

  const handleViewSocial = (social: RecurringSocialTemplate) => {
    toast({
      title: getLocalizedText(social.name, t, social.nameKey),
      description: t("recurringSocials.toast.viewDetails", {
        type: getSocialTypeLabel(social.socialType, t),
        status: getStatusLabel(social.status, t),
      }),
    })
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("recurringSocials.page.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("recurringSocials.page.subtitle")}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "create" | "list")}
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="list" className="gap-2">
              {t("recurringSocials.page.tabs.list")}
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-slate-100">
                {socials.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="size-4" />
              {t("recurringSocials.page.tabs.create")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <RecurringSocialsList
              socials={socials}
              onEdit={handleEditSocial}
              onPause={handlePauseSocial}
              onDelete={handleDeleteSocial}
              onView={handleViewSocial}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("recurringSocials.page.createTitle")}</CardTitle>
                <CardDescription>
                  {t("recurringSocials.page.createDescription")}
                </CardDescription>
              </CardHeader>
            </Card>

            <RecurringSocialsForm onSubmit={handleCreateSocial} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
