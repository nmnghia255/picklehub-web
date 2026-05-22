export type ReservationStatus =
  | "HOLDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED"

export type ReservationPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"

export type ReservationSource = "USER" | "STAFF" | "ADMIN"

export type ReservationTabValue =
  | "all"
  | "active"
  | "awaiting-payment"
  | "expiring-soon"
  | "confirmed"
  | "cancelled"

export interface ReservationTimelineEntry {
  label: string
  timestamp: Date
  actor: string
}

export interface ReservationAuditEntry {
  action: string
  timestamp: Date
  actor: string
}

export interface ReservationRecord {
  id: string
  customerName: string
  phone: string
  notes: string
  courtId: string
  courtName: string
  reservationDate: Date
  timeSlot: string
  durationMinutes: number
  status: ReservationStatus
  countdownMode: "remaining" | "expiresAt" | "expired"
  countdownText: string
  holdExpiresAt: Date
  paymentStatus: ReservationPaymentStatus
  paymentMethod: string
  transactionId?: string
  source: ReservationSource
  totalPrice: number
  paymentAttemptAt?: Date
  confirmedAt?: Date
  createdAt: Date
  updatedAt: Date
  timeline: ReservationTimelineEntry[]
  auditLog: ReservationAuditEntry[]
}

export interface CourtOption {
  value: string
  label: string
}

export const COURT_OPTIONS: CourtOption[] = [
  { value: "all", label: "All courts" },
  { value: "court-a", label: "Court A" },
  { value: "court-b", label: "Court B" },
  { value: "court-c", label: "Court C" },
  { value: "court-d", label: "Court D" },
  { value: "center-court", label: "Center Court" },
]

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function formatCurrencyVnd(value: number) {
  return currencyFormatter.format(value).replace("$", "$ ")
}

export function formatReservationDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatReservationTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDateRangeLabel(range: { from?: Date; to?: Date }) {
  if (!range.from && !range.to) return "Any date"
  if (range.from && range.to) {
    return `${formatReservationDate(range.from)} - ${formatReservationDate(range.to)}`
  }
  if (range.from) return `From ${formatReservationDate(range.from)}`
  if (range.to) return `Until ${formatReservationDate(range.to)}`
  return "Any date"
}

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000)
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60_000)
}

function timeline(
  label: string,
  minutesAgo: number,
  actor: string
): ReservationTimelineEntry {
  return {
    label,
    timestamp: minutesFromNow(-minutesAgo),
    actor,
  }
}

function audit(
  action: string,
  minutesAgo: number,
  actor: string
): ReservationAuditEntry {
  return {
    action,
    timestamp: minutesFromNow(-minutesAgo),
    actor,
  }
}

export function isExpiringSoon(reservation: ReservationRecord) {
  if (
    reservation.status === "CONFIRMED" ||
    reservation.status === "EXPIRED" ||
    reservation.status === "CANCELLED"
  ) {
    return false
  }

  const minutesLeft = Math.max(
    0,
    Math.round((reservation.holdExpiresAt.getTime() - Date.now()) / 60_000)
  )

  return minutesLeft <= 15
}

function createReservation(
  input: Omit<
    ReservationRecord,
    "updatedAt" | "createdAt" | "timeline" | "auditLog"
  > & {
    createdAgoMinutes: number
    updatedAgoMinutes: number
  }
): ReservationRecord {
  const createdAt = minutesFromNow(-input.createdAgoMinutes)
  const updatedAt = minutesFromNow(-input.updatedAgoMinutes)

  return {
    ...input,
    createdAt,
    updatedAt,
    timeline: [
      timeline("Reservation created", input.createdAgoMinutes, input.source),
      ...(input.paymentAttemptAt
        ? [
            timeline(
              "Payment attempt recorded",
              Math.max(5, input.updatedAgoMinutes - 7),
              "System"
            ),
          ]
        : []),
      ...(input.confirmedAt
        ? [
            timeline(
              "Reservation confirmed",
              Math.max(5, input.updatedAgoMinutes - 2),
              "Admin"
            ),
          ]
        : []),
      timeline("Expiration checkpoint reached", 1, "System"),
    ],
    auditLog: [
      audit("Created temporary hold", input.createdAgoMinutes, input.source),
      ...(input.paymentAttemptAt
        ? [
            audit(
              `Payment ${input.paymentStatus.toLowerCase()} recorded`,
              Math.max(8, input.updatedAgoMinutes - 7),
              "System"
            ),
          ]
        : []),
      ...(input.confirmedAt
        ? [
            audit(
              "Reservation confirmed",
              Math.max(8, input.updatedAgoMinutes - 2),
              "Admin"
            ),
          ]
        : []),
    ],
  }
}

export const MOCK_RESERVATIONS: ReservationRecord[] = [
  createReservation({
    id: "RH-2401",
    customerName: "Mia Thompson",
    phone: "(415) 555-0132",
    notes: "Needs a quieter court for beginner coaching.",
    courtId: "court-a",
    courtName: "Court A",
    reservationDate: daysFromNow(1),
    timeSlot: "18:00 - 19:00",
    durationMinutes: 60,
    status: "HOLDING",
    countdownMode: "remaining",
    countdownText: "04:32 remaining",
    holdExpiresAt: minutesFromNow(5),
    paymentStatus: "PENDING",
    paymentMethod: "Card",
    source: "USER",
    totalPrice: 56,
    createdAgoMinutes: 21,
    updatedAgoMinutes: 4,
  }),
  createReservation({
    id: "RH-2402",
    customerName: "Noah Patel",
    phone: "(646) 555-0184",
    notes: "Waiting on transfer approval from team captain.",
    courtId: "court-b",
    courtName: "Court B",
    reservationDate: daysFromNow(1),
    timeSlot: "19:00 - 20:30",
    durationMinutes: 90,
    status: "AWAITING_PAYMENT",
    countdownMode: "expiresAt",
    countdownText: "Expires at 19:30",
    holdExpiresAt: minutesFromNow(18),
    paymentStatus: "FAILED",
    paymentMethod: "Bank transfer",
    transactionId: "TRX-68214",
    paymentAttemptAt: minutesFromNow(-11),
    source: "STAFF",
    totalPrice: 84,
    createdAgoMinutes: 33,
    updatedAgoMinutes: 11,
  }),
  createReservation({
    id: "RH-2403",
    customerName: "Olivia Nguyen",
    phone: "(202) 555-0118",
    notes: "Confirmed for a mixed doubles ladder match.",
    courtId: "center-court",
    courtName: "Center Court",
    reservationDate: daysFromNow(2),
    timeSlot: "17:30 - 19:00",
    durationMinutes: 90,
    status: "CONFIRMED",
    countdownMode: "expiresAt",
    countdownText: "Expires at 20:00",
    holdExpiresAt: minutesFromNow(140),
    paymentStatus: "PAID",
    paymentMethod: "Apple Pay",
    transactionId: "TRX-94502",
    paymentAttemptAt: minutesFromNow(-28),
    confirmedAt: minutesFromNow(-16),
    source: "USER",
    totalPrice: 96,
    createdAgoMinutes: 64,
    updatedAgoMinutes: 16,
  }),
  createReservation({
    id: "RH-2404",
    customerName: "Ethan Brooks",
    phone: "(312) 555-0109",
    notes: "Hold expired while the group was coordinating payment.",
    courtId: "court-c",
    courtName: "Court C",
    reservationDate: daysFromNow(0),
    timeSlot: "16:00 - 17:00",
    durationMinutes: 60,
    status: "EXPIRED",
    countdownMode: "expired",
    countdownText: "Expired",
    holdExpiresAt: minutesFromNow(-12),
    paymentStatus: "PENDING",
    paymentMethod: "Cash",
    source: "ADMIN",
    totalPrice: 48,
    createdAgoMinutes: 45,
    updatedAgoMinutes: 12,
  }),
  createReservation({
    id: "RH-2405",
    customerName: "Sophia Garcia",
    phone: "(503) 555-0171",
    notes: "Cancelled after the weather warning was posted.",
    courtId: "court-d",
    courtName: "Court D",
    reservationDate: daysFromNow(3),
    timeSlot: "20:00 - 21:30",
    durationMinutes: 90,
    status: "CANCELLED",
    countdownMode: "expired",
    countdownText: "Expired",
    holdExpiresAt: minutesFromNow(-2),
    paymentStatus: "REFUNDED",
    paymentMethod: "Card",
    transactionId: "TRX-18231",
    paymentAttemptAt: minutesFromNow(-34),
    source: "USER",
    totalPrice: 88,
    createdAgoMinutes: 93,
    updatedAgoMinutes: 20,
  }),
  createReservation({
    id: "RH-2406",
    customerName: "James Lee",
    phone: "(917) 555-0147",
    notes: "Awaiting on-site payment before locking in the slot.",
    courtId: "court-a",
    courtName: "Court A",
    reservationDate: daysFromNow(0),
    timeSlot: "18:30 - 19:30",
    durationMinutes: 60,
    status: "AWAITING_PAYMENT",
    countdownMode: "remaining",
    countdownText: "11:15 remaining",
    holdExpiresAt: minutesFromNow(11),
    paymentStatus: "PENDING",
    paymentMethod: "Cash",
    source: "STAFF",
    totalPrice: 52,
    createdAgoMinutes: 19,
    updatedAgoMinutes: 5,
  }),
  createReservation({
    id: "RH-2407",
    customerName: "Ava Wilson",
    phone: "(818) 555-0166",
    notes: "Corporate event hold created by front desk.",
    courtId: "center-court",
    courtName: "Center Court",
    reservationDate: daysFromNow(4),
    timeSlot: "08:00 - 09:30",
    durationMinutes: 90,
    status: "HOLDING",
    countdownMode: "remaining",
    countdownText: "09:48 remaining",
    holdExpiresAt: minutesFromNow(9),
    paymentStatus: "PENDING",
    paymentMethod: "Card",
    source: "ADMIN",
    totalPrice: 102,
    createdAgoMinutes: 25,
    updatedAgoMinutes: 3,
  }),
  createReservation({
    id: "RH-2408",
    customerName: "Daniel Kim",
    phone: "(206) 555-0190",
    notes: "Confirmed after deposit was verified.",
    courtId: "court-b",
    courtName: "Court B",
    reservationDate: daysFromNow(1),
    timeSlot: "21:00 - 22:00",
    durationMinutes: 60,
    status: "CONFIRMED",
    countdownMode: "expiresAt",
    countdownText: "Expires at 21:45",
    holdExpiresAt: minutesFromNow(180),
    paymentStatus: "PAID",
    paymentMethod: "Wallet",
    transactionId: "TRX-55201",
    paymentAttemptAt: minutesFromNow(-18),
    confirmedAt: minutesFromNow(-12),
    source: "USER",
    totalPrice: 60,
    createdAgoMinutes: 42,
    updatedAgoMinutes: 12,
  }),
  createReservation({
    id: "RH-2409",
    customerName: "Lily Carter",
    phone: "(718) 555-0129",
    notes: "Player requested a manual hold extension twice already.",
    courtId: "court-c",
    courtName: "Court C",
    reservationDate: daysFromNow(2),
    timeSlot: "15:00 - 16:30",
    durationMinutes: 90,
    status: "HOLDING",
    countdownMode: "remaining",
    countdownText: "03:12 remaining",
    holdExpiresAt: minutesFromNow(3),
    paymentStatus: "PENDING",
    paymentMethod: "Card",
    source: "STAFF",
    totalPrice: 72,
    createdAgoMinutes: 31,
    updatedAgoMinutes: 6,
  }),
  createReservation({
    id: "RH-2410",
    customerName: "Benjamin Stone",
    phone: "(407) 555-0155",
    notes: "Pre-booked by admin for league finals timing.",
    courtId: "court-d",
    courtName: "Court D",
    reservationDate: daysFromNow(5),
    timeSlot: "12:00 - 13:00",
    durationMinutes: 60,
    status: "CONFIRMED",
    countdownMode: "expiresAt",
    countdownText: "Expires at 12:45",
    holdExpiresAt: minutesFromNow(240),
    paymentStatus: "PAID",
    paymentMethod: "Card",
    transactionId: "TRX-73164",
    paymentAttemptAt: minutesFromNow(-42),
    confirmedAt: minutesFromNow(-40),
    source: "ADMIN",
    totalPrice: 54,
    createdAgoMinutes: 78,
    updatedAgoMinutes: 40,
  }),
]
