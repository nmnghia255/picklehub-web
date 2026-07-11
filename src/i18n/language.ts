"use client"

import i18n from "./client"
import { defaultLanguage, languageStorageKey } from "./settings"

export type SupportedLanguage = "en" | "vi"

export function isSupportedLanguage(
  value: string | null | undefined
): value is SupportedLanguage {
  return value === "en" || value === "vi"
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") {
    return isSupportedLanguage(i18n.language) ? i18n.language : defaultLanguage
  }

  const storedLanguage = window.localStorage.getItem(languageStorageKey)

  if (isSupportedLanguage(storedLanguage)) {
    return storedLanguage
  }

  return isSupportedLanguage(i18n.language) ? i18n.language : defaultLanguage
}

export async function setLanguagePreference(language: SupportedLanguage) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(languageStorageKey, language)
    document.documentElement.lang = language
  }

  await i18n.changeLanguage(language)
}
