"use client"

import { CourtScheduleWrapper } from "@/features/sport-center-management/components/courts-management/court-schedule-wrapper"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export default function Page() {
  const { t } = useSportCenterManagementTranslation()
  return (
    <div className="flex flex-col overflow-hidden p-6">
      <header className="flex shrink-0 items-center pb-4">
        <h1 className="text-2xl font-semibold">{t("courts.page.title")}</h1>
      </header>

      <CourtScheduleWrapper ownerMode={true} />
    </div>
  )
}
