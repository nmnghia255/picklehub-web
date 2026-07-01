import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AvailableSubscriptionPlan,
  SubscribeToPlanResponse,
  Subscription,
  SubscriptionDetail,
} from "../types/subscriptions"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const SubscriptionService = {
  getAllAvailablePlans: async () => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AvailableSubscriptionPlan[]>>(
      "/api/subscriptions/plans"
    )
    return unwrapApiResponse(response.data)
  },

  getSinglePlanById: async (id: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AvailableSubscriptionPlan>>(
      `/api/subscriptions/plans/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  // Admin only
  // updatePlan: async (id: string, payload: UpdateSubscriptionPlanPayload) => {
  //   const axios = await getAuthenticatedAxios()
  //   const response = await axios.patch<ApiResponse<Subscription>>(
  //     `/api/subscriptions/plans/${id}`,
  //     {  }
  //   )
  //   return unwrapApiResponse(response.data)
  // },

  getMySubscriptions: async () => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Subscription[]>>(
      "/api/subscriptions/me"
    )
    return unwrapApiResponse(response.data)
  },

  getSubscriptionDetail: async (id: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<SubscriptionDetail>>(
      `/api/subscriptions/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  cancelMySubscription: async (id: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Subscription>>(
      `/api/subscriptions/${id}/cancel`
    )
    return unwrapApiResponse(response.data)
  },

  // Creates a PENDING_PAYMENT subscription record and returns a VNPay payment URL.
  // Redirect the user to paymentUrl to complete payment.
  // The subscription only becomes ACTIVE after VNPay confirms payment via the IPN webhook.
  subscribeToPlan: async (planId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<SubscribeToPlanResponse>>(
      "/api/subscriptions",
      { planId }
    )
    return unwrapApiResponse(response.data)
  },
}
