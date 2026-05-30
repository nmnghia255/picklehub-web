import axiosLib from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ExpenseItem,
  FinanceSummary,
  FundItem,
  FundPayment,
  ListExpensesResult,
  ListFundsResult,
  ListMyFundsResult,
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

export async function listFunds(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: "deadline" | "amount"
    order?: "asc" | "desc"
  } = {}
): Promise<ListFundsResult> {
  const axios = await getAuthenticatedAxios()
  const sendParams = { ...params }
  // backend field is `requiredAmount`; translate frontend `amount` to backend `requiredAmount`
  if (params.sortBy === "amount") {
    // @ts-ignore
    sendParams.sortBy = "requiredAmount"
  }

  const response = await axios.get<ApiEnvelope<FundItem[]>>(`/api/groups/${groupId}/funds`, { params: sendParams })

  return {
    data: unwrapListResponse<FundItem>(response.data),
    meta: normalizeMeta(response.data),
    message: (response.data as { message?: string })?.message,
  }
}

export async function listMyFunds(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: "deadline" | "amount"
    order?: "asc" | "desc"
  } = {}
): Promise<ListMyFundsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<FundItem[]>>(
    `/api/groups/${groupId}/funds/me`,
    { params }
  )

  return {
    data: unwrapListResponse<FundItem>(response.data),
    meta: normalizeMeta(response.data),
    message: (response.data as { message?: string })?.message,
  }
}

export async function listExpenses(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    userId?: string
    sortBy?: "deadline" | "amount"
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

export async function getFundById(
  groupId: string,
  fundId: string
): Promise<{ data: FundItem; summary: FinanceSummary }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<{ data: FundItem; summary: FinanceSummary }>(
    `/api/groups/${groupId}/funds/${fundId}`
  )
  return response.data
}

export async function listFundPayments(
  groupId: string,
  fundId: string,
  params: {
    page?: number
    limit?: number
    sortBy?: "amount" | "paidAt"
    order?: "asc" | "desc"
  } = {}
): Promise<{
  data: FundPayment[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<FundPayment[]>>(
    `/api/groups/${groupId}/funds/${fundId}/payments`,
    { params }
  )

  return {
    data: unwrapListResponse<FundPayment>(response.data),
    meta: normalizeMeta(response.data),
  }
}

export async function createFund(
  groupId: string,
  payload: {
    title: string
    description?: string
    requiredAmount: string | number
    deadline?: string
    targetMembers: { userId: string; requiredAmount?: number }[]
    useCredit?: boolean
  }
): Promise<FundItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<FundItem>>(`/api/groups/${groupId}/funds`, payload)
  return unwrapData(response.data)
}

export async function updateFund(
  groupId: string,
  fundId: string,
  payload: {
    title?: string
    description?: string | null
    requiredAmount?: string | number
    deadline?: string
    targetMembers?: { userId: string; requiredAmount?: number }[]
  }
): Promise<FundItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<FundItem>>(
    `/api/groups/${groupId}/funds/${fundId}`,
    payload
  )
  return unwrapData(response.data)
}

export async function deleteFund(
  groupId: string,
  fundId: string
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<{ message: string }>(
    `/api/groups/${groupId}/funds/${fundId}`
  )
  return response.data
}

export async function payFund(
  groupId: string,
  fundId: string,
  payload: { paymentReceiptUrl?: string | null }
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string }>(
    `/api/groups/${groupId}/funds/${fundId}/pay`,
    payload
  )
  return response.data
}

export async function verifyFundPayment(
  groupId: string,
  fundId: string,
  paymentId: string,
  payload: { status: "PAID" | "REJECTED"; amountPaid?: number }
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string }>(
    `/api/groups/${groupId}/funds/${fundId}/payments/${paymentId}/verify`,
    payload
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
    // Backward compatibility: some environments only expose image upload endpoint.
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

export async function createExpense(
  groupId: string,
  payload: {
    title: string
    description?: string
    amount: string
    receiptUrl?: string
    expenseDate?: string
  }
): Promise<ExpenseItem> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<ExpenseItem>>(
    `/api/groups/${groupId}/expenses`,
    payload
  )
  return unwrapData(response.data)
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  payload: {
    title?: string
    description?: string | null
    amount?: string
    receiptUrl?: string | null
    expenseDate?: string
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
