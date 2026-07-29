"use server"

import { revalidatePath } from "next/cache"

import { PaymentService } from "../api/payment-service"
import type {
  PaymentSubmitRequest,
  VerifyPaymentAction,
} from "../types/payment"

export async function submitReceiptAction(
  socialId: string,
  receiptUrl: string
) {
  const result = await PaymentService.submitReceipt(socialId, receiptUrl)
  revalidatePath(`/socials/${socialId}`)
  return result
}

export async function submitPaymentAction(
  socialId: string,
  paymentSubmitRequest: PaymentSubmitRequest
) {
  const result = await PaymentService.submitPayment(
    socialId,
    paymentSubmitRequest
  )
  revalidatePath(`/socials/${socialId}`)
  return result
}

export async function verifyPaymentAction(
  socialId: string,
  participantId: string,
  actionOrPaymentId: VerifyPaymentAction | string,
  noteOrStatus?: string,
  amountPaid?: number
) {
  const result = await PaymentService.verifyPayment(
    socialId,
    participantId,
    actionOrPaymentId,
    noteOrStatus,
    amountPaid
  )
  revalidatePath(`/socials/${socialId}`)
  return result
}

export async function recordPaymentAction(
  socialId: string,
  participantId: string,
  amount: number,
  receiptUrl?: string
) {
  const result = await PaymentService.recordPayment(
    socialId,
    participantId,
    amount,
    receiptUrl
  )
  revalidatePath(`/socials/${socialId}`)
  return result
}
