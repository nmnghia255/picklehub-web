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
