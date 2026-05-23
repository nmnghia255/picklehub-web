"use client"

import { useTranslation } from "react-i18next"

export function useSocialsTranslation() {
  return useTranslation("common", { keyPrefix: "socials" })
}
