"use client"

import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"

import i18n from "@/i18n/client"
import { languageStorageKey, defaultLanguage } from "@/i18n/settings"

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return i18n.language
  }

  const storedLanguage = window.localStorage.getItem(languageStorageKey)

  if (storedLanguage === "vi" || storedLanguage === "en") return storedLanguage

  // Fallback to i18n's initialized language or configured default
  return i18n.language || defaultLanguage
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguage = getStoredLanguage()

      if (i18n.language !== nextLanguage) {
        void i18n.changeLanguage(nextLanguage)
      }

      document.documentElement.lang = nextLanguage
    }

    syncLanguage()
    window.addEventListener("storage", syncLanguage)

    return () => {
      window.removeEventListener("storage", syncLanguage)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
