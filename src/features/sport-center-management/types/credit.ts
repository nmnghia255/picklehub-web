export interface MyCredit {
  id: string
  playerId: string
  centerId: string
  balance: number
  center: SportCenter
  transactions: Transaction[]
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  bookingId: string
  amount: number
  type: string
  description: string
  createdAt: string
  updatedAt: string
  booking: Booking
}

interface SportCenter {
  id: string
  name: string
  address: string
  images: string[]
}

interface SimpleSportCenter {
  id: string
  name: string
}

interface SimpleCourt {
  id: string
  name: string
}

interface BookingItem {
  startTime: string
  endTime: string
  itemPrice: number
  court: SimpleCourt
}

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  creditApplied: number
  paymentRemaining: number
  center: SimpleSportCenter
  bookingItems: BookingItem[]
}

export interface CreditTransaction {
  balance: number
  center: SimpleSportCenter
  transactions: Transaction[]
}

export type CreditStatus = "ACTIVE" | "PARTIALLY_USED" | "USED" | "EXPIRED"

export type CancellationReason =
  | "CUSTOMER_CANCELLED"
  | "OWNER_CANCELLED"
  | "WEATHER"
  | "MAINTENANCE"
  | "OTHER"

export type CreditTabValue =
  | "all"
  | "active"
  | "partially-used"
  | "used"
  | "expired"

export interface CreditUsageEntry {
  timestamp: Date
  amount: number
  bookingId: string
  notes: string
}

export interface CreditTimelineEntry {
  label: string
  timestamp: Date
  actor: string
}

export interface CreditAuditEntry {
  action: string
  timestamp: Date
  actor: string
}

export interface CreditRecord {
  id: string
  creditCode: string
  customerName: string
  phone: string
  bookingCode: string
  originalBookingId: string
  courtName: string
  bookingDate: Date
  timeSlot: string
  creditAmount: number
  remainingAmount: number
  status: CreditStatus
  createdAt: Date
  expirationDate: Date
  cancellationReason: CancellationReason
  notes: string
  manualCredit: boolean
  usageHistory: CreditUsageEntry[]
  timeline: CreditTimelineEntry[]
  auditLog: CreditAuditEntry[]
}

export interface CourtOption {
  value: string
  label: string
}
