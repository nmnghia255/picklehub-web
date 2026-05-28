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
