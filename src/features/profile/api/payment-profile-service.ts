import { getAuthenticatedAxios } from "@/lib/server-api"

import type { PaymentProfile, PaymentProfileRequest } from "../types"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const PaymentProfileService = {
  createPaymentProfile: async function (
    createPaymentProfileRequest: PaymentProfileRequest
  ): Promise<PaymentProfile> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/users/me/payment-profiles`,
      createPaymentProfileRequest
    )
    return unwrapApiResponse<PaymentProfile>(response.data)
  },

  updatePaymentProfile: async function (
    updatePaymentProfileRequest: PaymentProfileRequest,
    id?: string
  ): Promise<PaymentProfile> {
    const axios = await getAuthenticatedAxios()
    const endpoint = id
      ? `/api/users/me/payment-profiles/${id}`
      : `/api/users/me/payment-profiles`
    const response = await axios.patch(endpoint, updatePaymentProfileRequest)
    return unwrapApiResponse<PaymentProfile>(response.data)
  },

  getPaymentProfile: async function (): Promise<
    PaymentProfile | PaymentProfile[]
  > {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/users/me/payment-profiles`)
    return unwrapApiResponse<PaymentProfile | PaymentProfile[]>(response.data)
  },

  removePaymentProfile: async function (id: string): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.delete(`/api/users/me/payment-profiles/${id}`)
  },
}
