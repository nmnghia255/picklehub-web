"use server"

import { PaymentService } from "../api/payment-service"

export async function submitPaymentAction(
  socialId: string,
  receiptUrl: string,
  amount: number
) {
  return PaymentService.submitPayment(socialId, receiptUrl, amount)
}
