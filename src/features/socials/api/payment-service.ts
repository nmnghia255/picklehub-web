import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateSocialResponse,
  DuplicateSessionRequest,
  LeaveSocialResponse,
  ListSocial,
  SocialDetail,
  SocialParticipant,
  UpdateSocialRequest,
} from "../types/social"

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
    receiptUrl: string,
    amount: number
  ): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.post(`/api/events/socials/${socialId}/participants/me/pay`, {
      receiptUrl,
      amount,
    })
  },

  verifyPayment: async function (
    socialId: string,
    participantId: string,
    paymentId: string,
    status: string,
    amountPaid: number
  ): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.post(
      `/api/events/socials/${socialId}/participants/${participantId}/verify`,
      {
        paymentId,
        status,
        amountPaid,
      }
    )
  },

  refundPayment: async function (
    socialId: string,
    participantId: string,
    amount: number
  ): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.post(
      `/api/events/socials/${socialId}/participants/${participantId}/refund`,
      {
        amount,
      }
    )
  },

  recordPayment: async function (
    socialId: string,
    participantId: string,
    amount: number,
    receiptUrl?: string
  ): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.post(
      `/api/events/socials/${socialId}/participants/${participantId}/record-payment`,
      {
        amount,
        receiptUrl,
      }
    )
  },
}
