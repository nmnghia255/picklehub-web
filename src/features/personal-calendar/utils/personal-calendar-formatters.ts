export function formatCalendarTime(isoString: string) {
  try {
    const date = new Date(isoString)
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  } catch {
    return ""
  }
}

export function formatCalendarDate(isoString: string, locale: string) {
  try {
    return new Date(isoString).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return ""
  }
}
