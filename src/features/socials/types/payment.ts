export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "OVERPAID"
  | "REFUNDED"

export interface VerifyPaymentRequest {
  paymentId: string
  status: PaymentStatus
  amountPaid: number
}

export interface PaymentRecord {
  amount: number
  receiptUrl: string
}
