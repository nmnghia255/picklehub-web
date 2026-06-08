"use client"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

export function SportCenterError() {
  const { t } = useSportCenterTranslation()
  return (
    <div className="p-4">
      <p className="text-red-500">{t("listing.errorLoading")}</p>
    </div>
  )
}
