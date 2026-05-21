"use client"

import { useEffect } from "react"
import { I18nextProvider, initReactI18next } from "react-i18next"

import {
  SOCIALS_I18N_RESOURCES,
  SOCIALS_LANGUAGE_STORAGE_KEY,
  SOCIALS_NAMESPACE,
  socialsI18n,
} from "./i18n"

let initializationPromise: Promise<void> | null = null

function ensureSocialsI18nInitialized() {
  if (socialsI18n.isInitialized) {
    return Promise.resolve()
  }

  if (!initializationPromise) {
    initializationPromise = socialsI18n
      .use(initReactI18next)
      .init({
        resources: SOCIALS_I18N_RESOURCES,
        lng: "en",
        fallbackLng: "en",
        defaultNS: SOCIALS_NAMESPACE,
        ns: [SOCIALS_NAMESPACE],
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      })
      .then(() => undefined)
  }

  return initializationPromise
}

export default function SocialsI18nProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    void ensureSocialsI18nInitialized()
  }, [])

  useEffect(() => {
    const syncLanguage = () => {
      const storedLanguage = window.localStorage.getItem(
        SOCIALS_LANGUAGE_STORAGE_KEY
      )
      const nextLanguage = storedLanguage === "vi" ? "vi" : "en"

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

  return <I18nextProvider i18n={socialsI18n}>{children}</I18nextProvider>
}
