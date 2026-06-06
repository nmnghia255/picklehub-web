import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApplyPriceRequest,
  ApplyPriceResponse,
  CourtBookingExpense,
  FinanceMember,
  FinanceSummary,
  SuggestedPriceRequest,
  SuggestedPriceResponse,
} from "../types/finance"

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

export const FinanceService = {
  getFinanceSummary: async function (
    socialId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<FinanceSummary> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/finances/summary`,
      {
        fromDate,
        toDate,
      }
    )
    return unwrapApiResponse<FinanceSummary>(response.data)
  },

  listMembers: async function (
    socialId: string,
    page: number,
    limit: number,
    minCredit: number,
    userId: string
  ): Promise<FinanceMember[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/finances/credit-balances`,
      {
        page,
        limit,
        minCredit,
        userId,
      }
    )
    return unwrapApiResponse<FinanceMember[]>(response.data)
  },

  listCourtBookings: async function (
    socialId: string
  ): Promise<CourtBookingExpense[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/finances/court-bookings`
    )
    return unwrapApiResponse<CourtBookingExpense[]>(response.data)
  },

  calculateSuggestedPricing: async function (
    socialId: string,
    suggestedPriceRequest: SuggestedPriceRequest
  ): Promise<SuggestedPriceResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/finances/pricing-calculator`,
      suggestedPriceRequest
    )
    return unwrapApiResponse<SuggestedPriceResponse>(response.data)
  },

  applyPrice: async function (
    socialId: string,
    applyPriceRequest: ApplyPriceRequest
  ): Promise<ApplyPriceResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/socials/${socialId}/finances/apply-pricing`,
      applyPriceRequest
    )
    return unwrapApiResponse<ApplyPriceResponse>(response.data)
  },
}
