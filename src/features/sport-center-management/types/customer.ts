import type { BookingStatus } from "./booking"
import type { CreditTransactionType, CreditWallet } from "./credit"

export interface CenterScope {
  id: string
  name: string
}

export interface CustomerScope {
  centerId: string | null
  centers: CenterScope[]
}

export interface Customer {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  phoneNumber: string
}

export interface CustomerSummary {
  visitCount: number
  completedVisitCount: number
  confirmedVisitCount: number
  pendingVisitCount: number
  cancelledVisitCount: number

  totalSpend: number
  cancelledSpend: number

  creditBalance: number

  firstVisitAt: string | null
  lastVisitAt: string | null

  centerCount: number
}

export interface CustomerCenterStatistic {
  centerId: string
  centerName: string

  visitCount: number

  totalSpend: number

  cancelledVisitCount: number
  cancelledSpend: number

  lastVisitAt: string | null
}

export interface SimpleCenter {
  id: string
  name: string
}

export interface LatestBooking {
  id: string

  date: string

  status: BookingStatus

  totalPrice: number

  creditApplied: number
  paymentRemaining: number

  cancelReason: string | null
  cancelledAt: string | null

  center: SimpleCenter

  createdAt: string
}

export interface CustomerListItem {
  customer: Customer

  summary: CustomerSummary

  centers: CustomerCenterStatistic[]

  latestBooking: LatestBooking | null
}

export interface Pagination {
  limit: number
  offset: number
  total: number
}

export interface CustomerListResponse {
  scope: CustomerScope

  data: CustomerListItem[]

  pagination: Pagination
}

// For customer profile

export interface CustomerDetailSummary {
  visitCount: number

  completedVisitCount: number
  confirmedVisitCount: number
  pendingVisitCount: number
  cancelledVisitCount: number

  totalSpend: number
  cancelledSpend: number

  creditBalance: number
  cancelledRefundAmount: number

  firstVisitAt: string | null
  lastVisitAt: string | null
}

export interface CreditTransaction {
  id: string

  bookingId: string | null

  amount: number

  type: CreditTransactionType

  description: string

  createdAt: string
}

export interface CustomerCenter {
  centerId: string
  centerName: string

  creditBalance: number

  visitCount: number

  totalSpend: number

  cancelledVisitCount: number
  cancelledSpend: number

  lastVisitAt: string | null

  latestCreditTransaction: CreditTransaction | null
}

export interface BookingCourtSummary {
  id: string
  name: string
}

export interface BookingItemSummary {
  startTime: string
  endTime: string

  itemPrice: number

  court: BookingCourtSummary
}

export interface RecentBooking {
  id: string

  center: SimpleCenter

  date: string

  status: BookingStatus

  totalPrice: number

  creditApplied: number
  paymentRemaining: number

  cancelReason: string | null
  cancelledAt: string | null

  createdAt: string

  bookingItems: BookingItemSummary[]
}

export interface CustomerDetailResponse {
  scope: CustomerScope

  customer: Customer

  summary: CustomerDetailSummary

  byCenter: CustomerCenter[]

  recentBookings: RecentBooking[]

  creditWallets: CreditWallet[]
}
