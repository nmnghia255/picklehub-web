import type { i18n as I18nInstance } from "i18next"

function getLanguageCandidates(i18n: I18nInstance) {
  return Array.from(
    new Set(
      [i18n.resolvedLanguage, i18n.language, ...(i18n.languages ?? [])].filter(
        (language): language is string =>
          typeof language === "string" && language.length > 0
      )
    )
  )
}

export function getTranslationStringArray(
  i18n: I18nInstance,
  namespace: string,
  key: string
) {
  for (const language of getLanguageCandidates(i18n)) {
    const value = i18n.getResource(language, namespace, key)

    if (Array.isArray(value)) {
      return value.map((item) => String(item))
    }

    if (typeof value === "string") {
      return [value]
    }

    if (value && typeof value === "object") {
      const entries = Object.values(value)
      if (entries.length > 0) {
        return entries.map((item) => String(item))
      }
    }
  }

  return []
}
