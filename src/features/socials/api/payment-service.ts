import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  PaymentRecord,
  PaymentSubmitRequest,
  PaymentSubmitResponse,
  TransactionStatus,
  VerifyPaymentRequest,
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
  submitPayment: async function (
    socialId: string,
    paymentSubmitRequest: PaymentSubmitRequest
  ): Promise<PaymentSubmitResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<PaymentSubmitResponse>(
      `/api/events/socials/${socialId}/participants/me/pay`,
      paymentSubmitRequest
    )
    return unwrapApiResponse<PaymentSubmitResponse>(response.data)
  },

  verifyPayment: async function (
    socialId: string,
    participantId: string,
    paymentId: string,
    status: TransactionStatus,
    amountPaid: number
  ): Promise<VerifyPaymentRequest> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/events/socials/${socialId}/participants/${participantId}/verify`,
      {
        paymentId,
        status,
        amountPaid,
      }
    )
    return unwrapApiResponse<VerifyPaymentRequest>(response.data)
  },

  refundPayment: async function (
    socialId: string,
    participantId: string,
    amount: number
  ): Promise<number> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/participants/${participantId}/refund`,
      {
        amount,
      }
    )
    return unwrapApiResponse<number>(response.data)
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
