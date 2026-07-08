import type { TFunction } from "i18next"

export function translateAuthMessage(t: TFunction, message?: string | null) {
  if (!message) return ""
  return t(message, { defaultValue: message })
}
