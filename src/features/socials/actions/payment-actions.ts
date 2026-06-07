"use server"

import { PaymentService } from "../api/payment-service"
import type { PaymentStatus } from "../types/payment"

export async function submitPaymentAction(
  socialId: string,
  receiptUrl: string,
  amount: number
) {
  return PaymentService.submitPayment(socialId, receiptUrl, amount)
}

export async function verifyPaymentAction(
  socialId: string,
  participantId: string,
  paymentId: string,
  status: PaymentStatus,
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
