"use client"

import { FileSearch } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export function RevenueEmptyState({ title }: { title: string }) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-muted/20 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileSearch className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {t("bookingList.empty.noResultsDescription")}
        </p>
      </div>
    </div>
  )
}
