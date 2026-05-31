"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  RevenueCancellationAnalysis,
  RevenueDailyStatistics,
  RevenueQueryParams,
  RevenueStatistics,
  RevenueSummary,
  RevenueTransaction,
  RevenueTransactionsPagination,
  RevenueTransactionsResponse,
} from "../types"

export async function getRevenueSummary(
  params: RevenueQueryParams
): Promise<RevenueSummary> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<RevenueSummary>(
    "/api/sport-centers/revenue/summary",
    {
      params,
    }
  )

  return response.data
}

export async function getRevenueStatistics(
  params: Pick<RevenueQueryParams, "centerId" | "from" | "to">
): Promise<RevenueStatistics> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<RevenueStatistics>(
    "/api/sport-centers/revenue/statistics",
    {
      params,
    }
  )

  return response.data
}

export async function getRevenueDailyStatistics(
  params: Pick<RevenueQueryParams, "centerId" | "from" | "to">
): Promise<RevenueDailyStatistics> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<RevenueDailyStatistics>(
    "/api/sport-centers/revenue/statistics/daily",
    {
      params,
    }
  )

  return response.data
}

export async function getRevenueCancellations(
  params: Pick<RevenueQueryParams, "centerId" | "from" | "to">
): Promise<RevenueCancellationAnalysis> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<RevenueCancellationAnalysis>(
    "/api/sport-centers/revenue/cancellations",
    {
      params,
    }
  )

  return response.data
}

function resolvePagination(
  payload: unknown
): RevenueTransactionsPagination | undefined {
  if (!payload || typeof payload !== "object") return undefined

  if ("pagination" in payload) {
    return (payload as { pagination?: RevenueTransactionsPagination })
      .pagination
  }

  if ("meta" in payload) {
    const meta = (
      payload as {
        meta?: { limit: number; offset: number; total: number }
      }
    ).meta

    if (meta) {
      return {
        limit: meta.limit,
        offset: meta.offset,
        total: meta.total,
      }
    }
  }

  return undefined
}

export async function getRevenueTransactions(
  params: RevenueQueryParams
): Promise<RevenueTransactionsResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    | RevenueTransaction[]
    | RevenueTransactionsResponse
    | { data: RevenueTransaction[]; pagination?: RevenueTransactionsPagination }
  >("/api/sport-centers/revenue/transactions", {
    params,
  })

  if (Array.isArray(response.data)) {
    return { data: response.data }
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    const payload = response.data as { data: RevenueTransaction[] }
    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      pagination: resolvePagination(response.data),
    }
  }

  return { data: [] }
}

export async function exportRevenueCsv(
  params: RevenueQueryParams
): Promise<string | null> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post(
    "/api/sport-centers/revenue/export/csv",
    null,
    {
      params,
    }
  )

  const payload = response.data

  if (typeof payload === "string") {
    return payload
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      url?: string
      downloadUrl?: string
      fileUrl?: string
    }

    return candidate.url ?? candidate.downloadUrl ?? candidate.fileUrl ?? null
  }

  return null
}
