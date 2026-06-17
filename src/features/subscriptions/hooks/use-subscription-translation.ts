"use client"

import { useTranslation } from "react-i18next"

export function useSubscriptionTranslation() {
  const { t } = useTranslation("subscriptions")

  return {
    t: (key: string, options?: Record<string, unknown>) => {
      return t(key, options)
    },
  }
}
