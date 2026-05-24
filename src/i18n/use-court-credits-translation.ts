"use client"

import { useTranslation } from "react-i18next"

export function useCourtCreditsTranslation() {
  return useTranslation("common", {
    keyPrefix: "sportCenterManagement.courtCredits",
  })
}
