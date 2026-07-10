export type RevenueStatus = "PENDING_REVIEW" | "SETTLED" | "REJECTED" | "VOIDED"

export type RevenueMethod = "BANK_TRANSFER" | "CASH"

export type RevenuePeriod = {
  from: string
  to: string
}

export type RevenueSummaryByCenter = {
  centerId: string
  centerName: string
  settledRevenue: number
  pendingRevenue: number
  settledTransactionCount: number
  pendingTransactionCount: number
}

export type RevenueSummary = {
  centerId: string | null
  period: RevenuePeriod
  totalSettledRevenue: number
  totalPendingRevenue: number
  courtCostVnd: number
  netRevenueVnd: number
  settledTransactionCount: number
  pendingTransactionCount: number
  byCenter: RevenueSummaryByCenter[]
}

export type RevenueGrossByCenter = {
  centerId: string
  centerName: string
  courtRevenue: number
  serviceRevenue: number
  productRevenue: number
  grossRevenue: number
  bookingCount: number
  serviceLineCount: number
  productLineCount: number
}

export type RevenueGrossStatistics = {
  totalCourtRevenue: number
  totalServiceRevenue: number
  totalProductRevenue: number
  totalRevenue: number
  bookingCount: number
  serviceLineCount: number
  productLineCount: number
  byCenter: RevenueGrossByCenter[]
}

export type RevenueStatistics = {
  centerId: string | null
  period: RevenuePeriod
  cashRevenue: RevenueSummary
  grossRevenue: RevenueGrossStatistics
}

export type RevenueDailyStatistic = {
  date: string
  courtRevenue: number
  serviceRevenue: number
  productRevenue: number
  grossRevenue: number
  settledCashRevenue: number
  pendingCashRevenue: number
  bookingCount: number
  settledTransactionCount: number
  pendingTransactionCount: number
}

export type RevenueDailyStatistics = {
  centerId: string | null
  period: RevenuePeriod
  byDay: RevenueDailyStatistic[]
}

export type RevenueCancellationByCenter = {
  centerId: string
  centerName: string
  cancelledBookingCount: number
  cancelledRevenue: number
  refundedCreditAmount: number
}

export type RevenueCancellationByReason = {
  cancelReason: string
  cancelledBookingCount: number
  cancelledRevenue: number
  refundedCreditAmount: number
}

export type RevenueCancellationAnalysis = {
  centerId: string | null
  period: RevenuePeriod
  totalCancelledBookingCount: number
  totalCancelledRevenue: number
  totalRefundedCreditAmount: number
  byCenter: RevenueCancellationByCenter[]
  byReason: RevenueCancellationByReason[]
}

export type RevenueTransactionsPagination = {
  limit: number
  offset: number
  total: number
}

export type RevenueTransaction = {
  id: string
  bookingId: string
  centerId: string
  playerId: string
  amount: number
  method: RevenueMethod
  status: RevenueStatus
  courtCostVnd?: number | null
  netRevenueVnd?: number | null
  proofUrl?: string | null
  receivedAt?: string | null
  reviewedAt?: string | null
  rejectedAt?: string | null
  rejectedReason?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  fee?: number | null
  platformFee?: number | null
  center?: {
    id: string
    name: string
  }
  booking?: {
    id: string
    date?: string
    status?: string
    totalPrice?: number
    creditApplied?: number
    paymentRemaining?: number
    paymentProofUrl?: string | null
    paymentProofUploadedAt?: string | null
  }
}

export type RevenueTransactionsResponse = {
  data: RevenueTransaction[]
  pagination?: RevenueTransactionsPagination
}

export type RevenueQueryParams = {
  centerId?: string
  from?: string
  to?: string
  status?: RevenueStatus
  method?: RevenueMethod
  limit?: number
  offset?: number
}
