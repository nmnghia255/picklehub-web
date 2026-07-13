"use client"

import React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

interface RecurringSocialsFiltersProps {
  onFilterChange: (filter: string) => void
  defaultValue?: string
}

export function RecurringSocialsFilters({
  onFilterChange,
  defaultValue = "all",
}: RecurringSocialsFiltersProps) {
  const { t } = useRecurringSocialsTranslation()

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onFilterChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          {t("recurringSocials.list.statuses.all")}
        </TabsTrigger>
        <TabsTrigger value="weekly">
          {t("recurringSocials.form.recurrenceTypes.weekly")}
        </TabsTrigger>
        <TabsTrigger value="monthly">
          {t("recurringSocials.form.recurrenceTypes.monthly")}
        </TabsTrigger>
        <TabsTrigger value="quarterly">
          {t("recurringSocials.form.recurrenceTypes.quarterly")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
