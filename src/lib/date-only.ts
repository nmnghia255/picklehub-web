const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseDateOnly(value: string): Date | undefined {
  const match = DATE_ONLY_PATTERN.exec(value)
  if (!match) return undefined

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function formatDateOnly(value: string, locale: string): string {
  const match = DATE_ONLY_PATTERN.exec(value)
  if (!match) return value

  const [, year, month, day] = match
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}
