import type {
  CancellationReason,
  CourtOption,
  CreditAuditEntry,
  CreditRecord,
  CreditTimelineEntry,
  CreditUsageEntry,
} from "../types/credit"

export const COURT_OPTIONS: CourtOption[] = [
  { value: "all", label: "All courts" },
  { value: "court-a", label: "Court A" },
  { value: "court-b", label: "Court B" },
  { value: "court-c", label: "Court C" },
  { value: "court-d", label: "Court D" },
  { value: "center-court", label: "Center Court" },
]

export const CANCELLATION_REASON_OPTIONS: Array<{
  value: "all" | CancellationReason
  label: string
}> = [
  { value: "all", label: "All reasons" },
  { value: "CUSTOMER_CANCELLED", label: "Customer Cancelled" },
  { value: "OWNER_CANCELLED", label: "Owner Cancelled" },
  { value: "WEATHER", label: "Weather" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
]

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export function formatCurrencyVnd(value: number) {
  return vndFormatter.format(value)
}

function resolveDateLocale(locale: string) {
  return locale.startsWith("vi") ? "vi-VN" : "en-GB"
}

export function formatCreditDate(date: Date, locale = "en-GB") {
  return new Intl.DateTimeFormat(resolveDateLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatCreditDateTime(date: Date, locale = "en-GB") {
  return new Intl.DateTimeFormat(resolveDateLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDateRangeLabel(
  range: { from?: Date; to?: Date },
  locale = "en-GB"
) {
  if (!range.from && !range.to) {
    return locale.startsWith("vi") ? "Mọi ngày" : "Any date"
  }

  if (range.from && range.to) {
    return `${formatCreditDate(range.from, locale)} - ${formatCreditDate(
      range.to,
      locale
    )}`
  }

  if (range.from) {
    return `${locale.startsWith("vi") ? "Từ" : "From"} ${formatCreditDate(
      range.from,
      locale
    )}`
  }

  if (range.to) {
    return `${locale.startsWith("vi") ? "Đến" : "Until"} ${formatCreditDate(
      range.to,
      locale
    )}`
  }

  return locale.startsWith("vi") ? "Mọi ngày" : "Any date"
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60_000)
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60_000)
}

function timeline(
  label: string,
  minutesAgoValue: number,
  actor: string
): CreditTimelineEntry {
  return {
    label,
    timestamp: minutesAgo(minutesAgoValue),
    actor,
  }
}

function audit(
  action: string,
  minutesAgoValue: number,
  actor: string
): CreditAuditEntry {
  return {
    action,
    timestamp: minutesAgo(minutesAgoValue),
    actor,
  }
}

export function isExpiringSoon(credit: CreditRecord) {
  if (credit.status === "USED" || credit.status === "EXPIRED") {
    return false
  }

  const daysLeft = Math.round(
    (credit.expirationDate.getTime() - Date.now()) / 86_400_000
  )

  return daysLeft <= 7
}

function createCredit(
  input: Omit<CreditRecord, "createdAt" | "timeline" | "auditLog"> & {
    createdAgoDays: number
    timelineEntries?: CreditTimelineEntry[]
    auditEntries?: CreditAuditEntry[]
  }
): CreditRecord {
  const createdAt = daysAgo(input.createdAgoDays)

  return {
    ...input,
    createdAt,
    timeline: input.timelineEntries ?? [
      timeline(
        "Credit issued from cancelled booking",
        input.createdAgoDays * 24 * 60,
        "System"
      ),
    ],
    auditLog: input.auditEntries ?? [
      audit("Credit issued", input.createdAgoDays * 24 * 60, "System"),
    ],
  }
}

const usage = (
  daysAgoValue: number,
  amount: number,
  bookingId: string,
  notes: string
): CreditUsageEntry => ({
  timestamp: daysAgo(daysAgoValue),
  amount,
  bookingId,
  notes,
})

export const MOCK_CREDITS: CreditRecord[] = [
  createCredit({
    id: "CRD-001",
    creditCode: "CRD-2026-001",
    customerName: "Nguyen Van A",
    phone: "0901 222 333",
    bookingCode: "BK-1023",
    originalBookingId: "BK-1023",
    courtName: "Court A",
    bookingDate: daysAgo(18),
    timeSlot: "18:00 - 19:00",
    creditAmount: 300000,
    remainingAmount: 150000,
    status: "PARTIALLY_USED",
    expirationDate: daysFromNow(31),
    cancellationReason: "OWNER_CANCELLED",
    notes: "Owner closed the court for a private event.",
    manualCredit: false,
    usageHistory: [
      usage(13, 100000, "BK-2050", "Used for evening booking"),
      usage(9, 50000, "BK-2180", "Follow-up booking adjustment"),
    ],
    createdAgoDays: 18,
    timelineEntries: [
      timeline("Credit issued from cancelled booking", 18 * 24 * 60, "System"),
      timeline("Credit partially used", 13 * 24 * 60, "Customer"),
      timeline("Credit partially used", 9 * 24 * 60, "Customer"),
    ],
    auditEntries: [
      audit("Credit issued", 18 * 24 * 60, "System"),
      audit("Partial usage recorded", 13 * 24 * 60, "System"),
      audit("Partial usage recorded", 9 * 24 * 60, "System"),
    ],
  }),
  createCredit({
    id: "CRD-002",
    creditCode: "CRD-2026-002",
    customerName: "Tran Thi B",
    phone: "0912 444 555",
    bookingCode: "BK-1048",
    originalBookingId: "BK-1048",
    courtName: "Court B",
    bookingDate: daysAgo(22),
    timeSlot: "07:00 - 08:30",
    creditAmount: 240000,
    remainingAmount: 240000,
    status: "ACTIVE",
    expirationDate: daysFromNow(12),
    cancellationReason: "CUSTOMER_CANCELLED",
    notes: "Customer cancelled due to a schedule conflict.",
    manualCredit: false,
    usageHistory: [],
    createdAgoDays: 22,
  }),
  createCredit({
    id: "CRD-003",
    creditCode: "CRD-2026-003",
    customerName: "Le Quang C",
    phone: "0987 111 222",
    bookingCode: "BK-1077",
    originalBookingId: "BK-1077",
    courtName: "Center Court",
    bookingDate: daysAgo(27),
    timeSlot: "20:00 - 21:30",
    creditAmount: 500000,
    remainingAmount: 0,
    status: "USED",
    expirationDate: daysFromNow(4),
    cancellationReason: "WEATHER",
    notes: "Heavy rain forced the session to be cancelled.",
    manualCredit: false,
    usageHistory: [
      usage(20, 200000, "BK-3002", "Applied to doubles booking"),
      usage(15, 300000, "BK-3101", "Applied to weekend booking"),
    ],
    createdAgoDays: 27,
  }),
  createCredit({
    id: "CRD-004",
    creditCode: "CRD-2026-004",
    customerName: "Pham Minh D",
    phone: "0903 888 123",
    bookingCode: "BK-1105",
    originalBookingId: "BK-1105",
    courtName: "Court C",
    bookingDate: daysAgo(9),
    timeSlot: "16:00 - 17:00",
    creditAmount: 180000,
    remainingAmount: 0,
    status: "EXPIRED",
    expirationDate: daysAgo(3),
    cancellationReason: "MAINTENANCE",
    notes: "Court surface maintenance blocked the booking window.",
    manualCredit: false,
    usageHistory: [],
    createdAgoDays: 9,
  }),
  createCredit({
    id: "CRD-005",
    creditCode: "CRD-2026-005",
    customerName: "Hoang Gia E",
    phone: "0977 222 900",
    bookingCode: "BK-1120",
    originalBookingId: "BK-1120",
    courtName: "Court D",
    bookingDate: daysAgo(15),
    timeSlot: "19:30 - 21:00",
    creditAmount: 420000,
    remainingAmount: 120000,
    status: "PARTIALLY_USED",
    expirationDate: daysFromNow(6),
    cancellationReason: "OTHER",
    notes: "Administrative cancellation after roster change.",
    manualCredit: false,
    usageHistory: [usage(11, 300000, "BK-3210", "Used for weekday booking")],
    createdAgoDays: 15,
  }),
  createCredit({
    id: "CRD-006",
    creditCode: "CRD-2026-006",
    customerName: "Vo Khanh F",
    phone: "0911 345 678",
    bookingCode: "BK-1144",
    originalBookingId: "BK-1144",
    courtName: "Center Court",
    bookingDate: daysAgo(6),
    timeSlot: "08:00 - 09:30",
    creditAmount: 350000,
    remainingAmount: 350000,
    status: "ACTIVE",
    expirationDate: daysFromNow(4),
    cancellationReason: "OWNER_CANCELLED",
    notes: "Owner event created a full credit for the customer.",
    manualCredit: true,
    usageHistory: [],
    createdAgoDays: 6,
  }),
  createCredit({
    id: "CRD-007",
    creditCode: "CRD-2026-007",
    customerName: "Bui Thu G",
    phone: "0905 777 445",
    bookingCode: "BK-1160",
    originalBookingId: "BK-1160",
    courtName: "Court A",
    bookingDate: daysAgo(31),
    timeSlot: "12:00 - 13:00",
    creditAmount: 260000,
    remainingAmount: 0,
    status: "USED",
    expirationDate: daysFromNow(9),
    cancellationReason: "CUSTOMER_CANCELLED",
    notes: "Used across multiple follow-up bookings.",
    manualCredit: false,
    usageHistory: [
      usage(20, 120000, "BK-3322", "Applied to singles booking"),
      usage(17, 140000, "BK-3370", "Applied to training session"),
    ],
    createdAgoDays: 31,
  }),
  createCredit({
    id: "CRD-008",
    creditCode: "CRD-2026-008",
    customerName: "Dang Nhat H",
    phone: "0933 640 810",
    bookingCode: "BK-1188",
    originalBookingId: "BK-1188",
    courtName: "Court B",
    bookingDate: daysAgo(12),
    timeSlot: "22:00 - 23:00",
    creditAmount: 150000,
    remainingAmount: 150000,
    status: "ACTIVE",
    expirationDate: daysFromNow(2),
    cancellationReason: "WEATHER",
    notes: "Night session cancelled because of storm alerts.",
    manualCredit: false,
    usageHistory: [],
    createdAgoDays: 12,
  }),
  createCredit({
    id: "CRD-009",
    creditCode: "CRD-2026-009",
    customerName: "Truong An I",
    phone: "0909 410 220",
    bookingCode: "BK-1201",
    originalBookingId: "BK-1201",
    courtName: "Court C",
    bookingDate: daysAgo(5),
    timeSlot: "14:00 - 15:00",
    creditAmount: 200000,
    remainingAmount: 0,
    status: "EXPIRED",
    expirationDate: daysAgo(1),
    cancellationReason: "MAINTENANCE",
    notes: "Expired after scheduled resurfacing window passed.",
    manualCredit: false,
    usageHistory: [],
    createdAgoDays: 5,
  }),
  createCredit({
    id: "CRD-010",
    creditCode: "CRD-2026-010",
    customerName: "Mai Linh J",
    phone: "0918 530 789",
    bookingCode: "BK-1224",
    originalBookingId: "BK-1224",
    courtName: "Court D",
    bookingDate: daysAgo(14),
    timeSlot: "17:30 - 19:00",
    creditAmount: 600000,
    remainingAmount: 450000,
    status: "PARTIALLY_USED",
    expirationDate: daysFromNow(15),
    cancellationReason: "OWNER_CANCELLED",
    notes: "Partial usage across tournament rescheduling.",
    manualCredit: true,
    usageHistory: [
      usage(8, 150000, "BK-3441", "Used for rescheduled league booking"),
    ],
    createdAgoDays: 14,
  }),
]
