"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import {
  SOCIALS_LANGUAGE_STORAGE_KEY,
  SOCIALS_NAMESPACE,
  socialsI18n,
} from "./i18n"

function getStoredLanguage() {
  if (typeof window === "undefined") {
    return "en"
  }

  const storedLanguage = window.localStorage.getItem(
    SOCIALS_LANGUAGE_STORAGE_KEY
  )

  return storedLanguage === "vi" ? "vi" : "en"
}

export function useSocialsTranslation() {
  const translation = useTranslation(SOCIALS_NAMESPACE)

  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguage = getStoredLanguage()

      if (socialsI18n.language !== nextLanguage) {
        void socialsI18n.changeLanguage(nextLanguage)
      }
    }

    syncLanguage()
    window.addEventListener("storage", syncLanguage)

    return () => {
      window.removeEventListener("storage", syncLanguage)
    }
  }, [])

  return translation
}
