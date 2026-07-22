"use server"

import { PaymentService } from "../api/payment-service"
import type { TransactionStatus } from "../types/payment"
import type { PaymentSubmitRequest } from "../types/payment"

export async function submitPaymentAction(
  socialId: string,
  paymentSubmitRequest: PaymentSubmitRequest
) {
  return PaymentService.submitPayment(socialId, paymentSubmitRequest)
}

export async function verifyPaymentAction(
  socialId: string,
  participantId: string,
  paymentId: string,
  status: TransactionStatus,
  amountPaid: number
) {
  return PaymentService.verifyPayment(
    socialId,
    participantId,
    paymentId,
    status,
    amountPaid
  )
}

export async function refundPaymentAction(
  socialId: string,
  participantId: string,
  amount: number
) {
  return PaymentService.refundPayment(socialId, participantId, amount)
}

export async function recordPaymentAction(
  socialId: string,
  participantId: string,
  amount: number,
  receiptUrl?: string
) {
  return PaymentService.recordPayment(
    socialId,
    participantId,
    amount,
    receiptUrl
  )
}
