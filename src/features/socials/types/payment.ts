export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "OVERPAID"
  | "REFUNDED"

export type TransactionStatus = "PENDING_REVIEW" | "CONFIRMED" | "REJECTED"

export interface VerifyPaymentRequest {
  paymentId: string
  status: TransactionStatus
  amountPaid: number
}

export interface PaymentRecord {
  amount: number
  receiptUrl: string
}

export interface PaymentSubmitRequest {
  amount: number
  receiptUrl: string
}

export interface PaymentSubmitResponse {
  id: string
  socialParticipantId: string
  amount: number
  receiptUrl: string
  status: TransactionStatus
  transactionType: string
  createdById: string
  verifiedById: string | null
  createdAt: string
  updatedAt: string
}
