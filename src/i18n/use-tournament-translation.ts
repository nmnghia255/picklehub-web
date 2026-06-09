"use client"

import { useTranslation } from "react-i18next"

export function useTournamentTranslation() {
  return useTranslation("common", {
    keyPrefix: "tournament",
  })
}
