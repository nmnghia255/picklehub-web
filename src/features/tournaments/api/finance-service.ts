import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  Finance,
  FinanceRequest,
  FinanceStatus,
  FinanceSummary,
} from "../types/finance"

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

export const TournamentFinanceService = {
  createFinanceTransaction: async (
    tournamentId: string,
    finance: FinanceRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Finance>>(
      `/api/tournaments/${tournamentId}/transactions`,
      finance
    )
    return unwrapApiResponse(response.data)
  },

  getFinanceTransactions: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Finance[]>>(
      `/api/tournaments/${tournamentId}/transactions`
    )
    return unwrapApiResponse(response.data)
  },

  updateTransactionStatus: async (
    tournamentId: string,
    transactionId: string,
    status: FinanceStatus
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Finance>>(
      `/api/tournaments/${tournamentId}/transactions/${transactionId}/status`,
      { status }
    )
    return unwrapApiResponse(response.data)
  },

  getFinanceSummary: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<FinanceSummary>>(
      `/api/tournaments/${tournamentId}/finance/report`
    )
    return unwrapApiResponse(response.data)
  },

  deleteFinanceTransaction: async (
    tournamentId: string,
    transactionId: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/transactions/${transactionId}`
    )
    return unwrapApiResponse(response.data)
  },

  exportFinanceReport: async (
    tournamentId: string,
    format: "pdf" | "excel"
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ArrayBuffer>(
      `/api/tournaments/${tournamentId}/finance/report/export?format=${format}`,
      { responseType: "arraybuffer" }
    )
    return response.data
  },
}
