"use client"

import { useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"

import i18n from "@/i18n/client"
import {
  defaultLanguage,
  languageCookieKey,
  languageStorageKey,
} from "@/i18n/settings"

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return i18n.language
  }

  const storedLanguage = window.localStorage.getItem(languageStorageKey)

  if (storedLanguage === "vi" || storedLanguage === "en") return storedLanguage

  // Fallback to i18n's initialized language or configured default
  return i18n.language || defaultLanguage
}

function syncLanguageStorage(language: string) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(languageStorageKey, language)
  document.cookie = `${languageCookieKey}=${language}; path=/; max-age=31536000; samesite=lax`
  document.documentElement.lang = language
}

export function I18nProvider({
  children,
  initialLanguage = defaultLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: string
}) {
  const [language] = useState(() => {
    if (i18n.language !== initialLanguage) {
      void i18n.changeLanguage(initialLanguage)
    }

    return initialLanguage
  })

  useEffect(() => {
    syncLanguageStorage(language)

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
  }, [language])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
