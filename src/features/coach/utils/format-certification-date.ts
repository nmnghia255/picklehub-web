export function formatCertificationDate(value: string, locale: string) {
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (!dateOnly) return null

  const [year, month, day] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return new Intl.DateTimeFormat(
    locale,
    locale.startsWith("vi")
      ? {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "UTC",
        }
      : {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }
  ).format(date)
}
