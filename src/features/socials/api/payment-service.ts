import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  PaymentRecord,
  PaymentSubmitRequest,
  PaymentSubmitResponse,
  VerifyPaymentAction,
} from "../types/payment"

interface ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const PaymentService = {
  /**
   * Người chơi tải ảnh hóa đơn thanh toán
   * POST /api/events/socials/:socialId/participants/me/receipts
   */
  submitReceipt: async function (
    socialId: string,
    receiptUrl: string
  ): Promise<{ id: string; paymentStatus: string; receiptUrls: string[] }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/participants/me/receipts`,
      { receiptUrl }
    )
    return unwrapApiResponse(response.data)
  },

  submitPayment: async function (
    socialId: string,
    paymentSubmitRequest: PaymentSubmitRequest
  ): Promise<PaymentSubmitResponse> {
    const axios = await getAuthenticatedAxios()
    if (paymentSubmitRequest.receiptUrl) {
      await PaymentService.submitReceipt(
        socialId,
        paymentSubmitRequest.receiptUrl
      )
    }
    const response = await axios.post<PaymentSubmitResponse>(
      `/api/events/socials/${socialId}/participants/me/pay`,
      paymentSubmitRequest
    )
    return unwrapApiResponse<PaymentSubmitResponse>(response.data)
  },

  /**
   * Host xác nhận thanh toán 1-Touch (PAID hoặc WAIVE)
   * PATCH /api/events/socials/:socialId/participants/:participantId/verify
   */
  verifyPayment: async function (
    socialId: string,
    participantId: string,
    actionOrPaymentId: VerifyPaymentAction | string,
    noteOrStatus?: string,
    amountPaid?: number
  ): Promise<unknown> {
    const axios = await getAuthenticatedAxios()

    // Check if new API signature: verifyPayment(socialId, participantId, "PAID" | "WAIVE", note)
    const isNewSignature =
      actionOrPaymentId === "PAID" || actionOrPaymentId === "WAIVE"

    const body = isNewSignature
      ? { action: actionOrPaymentId, note: noteOrStatus }
      : {
          paymentId: actionOrPaymentId,
          status: noteOrStatus,
          amountPaid,
          action: "PAID",
        }

    const response = await axios.patch(
      `/api/events/socials/${socialId}/participants/${participantId}/verify`,
      body
    )
    return unwrapApiResponse(response.data)
  },

  recordPayment: async function (
    socialId: string,
    participantId: string,
    amount: number,
    receiptUrl?: string
  ): Promise<PaymentRecord> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/participants/${participantId}/record-payment`,
      {
        amount,
        receiptUrl,
      }
    )
    return unwrapApiResponse<PaymentRecord>(response.data)
  },
}
