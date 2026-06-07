import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateExpenseRequest,
  Expense,
  ListExpensesResponse,
} from "../types/expense"

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

export const ExpenseService = {
  createExpense: async function (
    socialId: string,
    createExpenseRequest: CreateExpenseRequest
  ): Promise<Expense> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/events/api/socials/${socialId}/expenses`,
      {
        ...createExpenseRequest,
        amount: String(createExpenseRequest.amount),
      }
    )
    return unwrapApiResponse(response.data)
  },

  listExpenses: async function (
    socialId: string
  ): Promise<ListExpensesResponse[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/events/api/socials/${socialId}/expenses`
    )
    return unwrapApiResponse<ListExpensesResponse[]>(response.data)
  },

  getExpenseDetail: async function (
    socialId: string,
    expenseId: string
  ): Promise<Expense> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/events/api/socials/${socialId}/expenses/${expenseId}`
    )
    return unwrapApiResponse<Expense>(response.data)
  },

  updateExpense: async function (
    socialId: string,
    expenseId: string,
    updateExpenseRequest: CreateExpenseRequest
  ): Promise<Expense> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/events/api/socials/${socialId}/expenses/${expenseId}`,
      {
        ...updateExpenseRequest,
        amount: String(updateExpenseRequest.amount),
      }
    )
    return unwrapApiResponse<Expense>(response.data)
  },

  deleteExpense: async function (
    socialId: string,
    expenseId: string
  ): Promise<void> {
    const axios = await getAuthenticatedAxios()
    await axios.delete(
      `/api/events/api/socials/${socialId}/expenses/${expenseId}`
    )
  },
}
