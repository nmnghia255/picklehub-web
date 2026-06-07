import axiosLib from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreditBalanceEntry,
  DebtStatus,
  ExpenseItem,
  FinanceSummary,
  ListCreditBalancesResult,
  ListExpensesResult,
  ListTransactionsResult,
  MyDebt,
  Transaction,
  TransactionStatus,
} from "../types/finance"

type ApiEnvelope<T> = {
  message?: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type MediaUploadResponse = {
  url: string
  publicId?: string
  format?: string
  resourceType?: string
  originalFilename?: string
}

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

function unwrapListResponse<T>(payload: ApiEnvelope<T[]> | T[] | unknown) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T[]>).data ?? []
  }

  return [] as T[]
}

function normalizeMeta(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("meta" in payload)) {
    return {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    }
  }

  return (
    payload as {
      meta: { page: number; limit: number; total: number; totalPages: number }
    }
  ).meta
}

export async function getFinanceSummary(
  groupId: string,
  params: { fromDate?: string; toDate?: string } = {}
): Promise<FinanceSummary> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<FinanceSummary>>(
    `/api/groups/${groupId}/finances/summary`,
    { params }
  )
  return unwrapData(response.data)
}

export async function listCreditBalances(
  groupId: string,
  params: {
    page?: number
    limit?: number
    minCredit?: number
    userId?: string
  } = {}
): Promise<ListCreditBalancesResult> {
  const axios = await getAuthenticatedAxios()
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  )

  const response = await axios.get<ApiEnvelope<CreditBalanceEntry[]>>(
    `/api/groups/${groupId}/finances/credit-balances`,
    { params: cleanParams }
  )

  return {
    data: unwrapListResponse<CreditBalanceEntry>(response.data),
    meta: normalizeMeta(response.data),
    message: (response.data as { message?: string })?.message,
  }
}

export async function createTransaction(
  groupId: string,
  payload: {
    amount: number
    receiptUrl?: string
  }
): Promise<Transaction> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<Transaction>>(
    `/api/groups/${groupId}/finances/transactions`,
    payload
  )
  return unwrapData(response.data)
}

export async function listTransactions(
  groupId: string,
  params: {
    page?: number
    limit?: number
    status?: TransactionStatus
  } = {}
): Promise<ListTransactionsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<Transaction[]>>(
    `/api/groups/${groupId}/finances/transactions`,
    { params }
  )

  return {
    data: unwrapListResponse<Transaction>(response.data),
    meta: normalizeMeta(response.data),
    message: (response.data as { message?: string })?.message,
  }
}

export async function verifyTransaction(
  groupId: string,
  txId: string,
  payload: { status: "VERIFIED" | "REJECTED" }
): Promise<Transaction> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<Transaction>>(
    `/api/groups/${groupId}/finances/transactions/${txId}/verify`,
    payload
  )
  return unwrapData(response.data)
}

export async function getMyDebt(groupId: string): Promise<MyDebt> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<MyDebt>>(
    `/api/groups/${groupId}/finances/me/debt`
  )
  return unwrapData(response.data)
}

export async function remindDebt(
  groupId: string,
  payload: { userIds: string[]; sendEmail?: boolean }
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string }>(
    `/api/groups/${groupId}/finances/remind`,
    payload
  )
  return response.data
}

export async function createExpense(
  groupId: string,
  payload: {
    title: string
    description?: string
    totalAmount: number
    receiptUrl?: string
    expenseDate: string
    allocations: { userId: string; requiredFee: number }[]
  }
): Promise<ExpenseItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<ExpenseItem>>(
    `/api/groups/${groupId}/expenses`,
    payload
  )
  return unwrapData(response.data)
}

export async function listExpenses(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    userId?: string
    sortBy?: string
    order?: "asc" | "desc"
  } = {}
): Promise<ListExpensesResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<ExpenseItem[]>>(
    `/api/groups/${groupId}/expenses`,
    { params }
  )

  return {
    data: unwrapListResponse<ExpenseItem>(response.data),
    meta: normalizeMeta(response.data),
    message: (response.data as { message?: string })?.message,
  }
}

export async function getExpenseById(
  groupId: string,
  expenseId: string
): Promise<ExpenseItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<ExpenseItem>>(
    `/api/groups/${groupId}/expenses/${expenseId}`
  )
  return unwrapData(response.data)
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  payload: {
    title?: string
    description?: string | null
    totalAmount?: number
    receiptUrl?: string | null
    expenseDate?: string
    allocations?: { userId: string; requiredFee: number }[]
  }
): Promise<ExpenseItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<ExpenseItem>>(
    `/api/groups/${groupId}/expenses/${expenseId}`,
    payload
  )
  return unwrapData(response.data)
}

export async function deleteExpense(
  groupId: string,
  expenseId: string
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<{ message: string }>(
    `/api/groups/${groupId}/expenses/${expenseId}`
  )
  return response.data
}

export async function uploadFinanceReceiptFile(
  file: File
): Promise<MediaUploadResponse> {
  const axios = await getAuthenticatedAxios()
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await axios.post<MediaUploadResponse>(
      "/api/media/files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return response.data
  } catch (error) {
    if (axiosLib.isAxiosError(error) && error.response?.status === 404) {
      const isImage = file.type.startsWith("image/")

      if (isImage) {
        const response = await axios.post<MediaUploadResponse>(
          "/api/media/images",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )

        return response.data
      }

      throw new Error(
        "Môi trường hiện tại chưa hỗ trợ upload Word/Excel/PDF. Vui lòng dùng ảnh hoặc triển khai API /api/media/files ở media-service."
      )
    }

    throw error
  }
}
