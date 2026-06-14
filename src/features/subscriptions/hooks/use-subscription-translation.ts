"use client"

import { useTranslation } from "react-i18next"

export function useSubscriptionTranslation() {
  const { t } = useTranslation("common")

  return {
    t: (key: string, options?: Record<string, unknown>) => {
      const rootKey = `subscriptions.${key}`
      const socialsKey = `socials.subscriptions.${key}`

      const translated = t(rootKey, options)
      if (translated && translated !== rootKey) {
        return translated
      }

      const translatedSocials = t(socialsKey, options)
      if (translatedSocials && translatedSocials !== socialsKey) {
        return translatedSocials
      }

      return key
    },
  }
}
