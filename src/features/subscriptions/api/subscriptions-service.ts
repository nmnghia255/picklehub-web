import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AvailableSubscriptionPlan,
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

  subscribeToPlan: async (planId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Subscription>>(
      "/api/subscriptions",
      { planId }
    )
    return unwrapApiResponse(response.data)
  },
}
