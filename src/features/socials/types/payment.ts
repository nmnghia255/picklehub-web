export type PaymentStatus = "UNPAID" | "PENDING_REVIEW" | "PAID"

export type ParticipantPaymentStatus = "UNPAID" | "PENDING_REVIEW" | "PAID"

export type TransactionStatus = "PENDING_REVIEW" | "CONFIRMED" | "REJECTED"

export type VerifyPaymentAction = "PAID" | "WAIVE"

export interface VerifySocialPaymentRequest {
  action?: VerifyPaymentAction
  paymentId?: string
  note?: string
}

export interface VerifyPaymentRequest {
  paymentId?: string
  status?: TransactionStatus
  amountPaid?: number
  action?: VerifyPaymentAction
  note?: string
}

export interface SubmitReceiptRequest {
  receiptUrl: string
}

export interface PaymentRecord {
  amount: number
  receiptUrl: string
}

export interface PaymentSubmitRequest {
  amount?: number
  receiptUrl: string
}

export interface PaymentSubmitResponse {
  id: string
  socialParticipantId: string
  amount: number
  receiptUrl: string
  status: TransactionStatus
  transactionType?: string
  createdById: string
  verifiedById: string | null
  createdAt: string
  updatedAt: string
}

export interface FinanceSummaryData {
  collectedAmount: number
  outstandingAmount: number
  totalExpectedRevenue: number
  totalExpense: number
  estimatedProfit: number
  paidMembersCount: number
  collectionProgress: number
}
