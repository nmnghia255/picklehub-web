const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const DATE_ONLY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
})

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
})

export function formatCurrencyVnd(value: number) {
  return VND_FORMATTER.format(value)
}

export function formatDate(dateValue?: string | null) {
  if (!dateValue) return "-"
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"
  return DATE_ONLY_FORMATTER.format(date)
}

export function formatShortDate(dateValue?: string | null) {
  if (!dateValue) return "-"
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"
  return DATE_SHORT_FORMATTER.format(date)
}

export function formatDateTime(dateValue?: string | null) {
  if (!dateValue) return "-"
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"
  return DATE_TIME_FORMATTER.format(date)
}

export function toDateInputValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date)

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""

  const year = getPart("year")
  const month = getPart("month")
  const day = getPart("day")

  return `${year}-${month}-${day}`
}

export function getDefaultDateRange() {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - 30)

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(today),
  }
}

export function getPresetDateRange(preset: "7d" | "30d" | "this-month") {
  const today = new Date()

  if (preset === "this-month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      from: toDateInputValue(firstDay),
      to: toDateInputValue(today),
    }
  }

  const days = preset === "7d" ? 7 : 30
  const from = new Date(today)
  from.setDate(today.getDate() - days)

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(today),
  }
}

export function buildExportFilename(from?: string, to?: string) {
  const safeFrom = from || "all"
  const safeTo = to || "all"

  return `revenue-transactions-${safeFrom}-${safeTo}.csv`
}

export function downloadFromUrl(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.rel = "noopener"
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
