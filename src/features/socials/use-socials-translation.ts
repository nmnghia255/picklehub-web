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

      // If the i18n instance hasn't been initialized yet, wait for initialization
      // and then apply the language change. This avoids calling into i18next
      // internals before resources/store are ready which can cause a runtime
      // TypeError (hasLanguageSomeTranslations undefined).
      if (socialsI18n.isInitialized) {
        if (socialsI18n.language !== nextLanguage) {
          void socialsI18n.changeLanguage(nextLanguage)
        }
      } else {
        const onInit = () => {
          try {
            if (socialsI18n.language !== nextLanguage) {
              void socialsI18n.changeLanguage(nextLanguage)
            }
          } finally {
            socialsI18n.off("initialized", onInit)
          }
        }

        socialsI18n.on("initialized", onInit)
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
