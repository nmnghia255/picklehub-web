import type {
  FinanceSummary,
  FundPayment,
  ListExpensesResult,
  ListFundsResult,
  ListMyFundsResult,
} from "../types/finance"
import type { Member } from "../types"

type QueryParams = Record<string, string | number | boolean | null | undefined>

function toSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()

  if (!params) {
    return searchParams
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.message || "Không thể tải dữ liệu tài chính.")
  }

  return (await response.json()) as T
}

export const financeQueryKeys = {
  group: (groupId: string) => ["group-finance", groupId] as const,
  members: (groupId: string) => ["group-finance", groupId, "members"] as const,
  summary: (groupId: string) => ["group-finance", groupId, "summary"] as const,
  funds: (groupId: string) => ["group-finance", groupId, "funds"] as const,
  myFunds: (groupId: string) => ["group-finance", groupId, "my-funds"] as const,
  expenses: (groupId: string) => ["group-finance", groupId, "expenses"] as const,
  fundPayments: (groupId: string, fundId: string) =>
    ["group-finance", groupId, "fund-payments", fundId] as const,
}

export async function getFinanceSummaryClient(
  groupId: string,
  params: { fromDate?: string; toDate?: string } = {}
): Promise<FinanceSummary> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<FinanceSummary>(`/api/groups/${groupId}/finances/summary${suffix}`)
}

export async function listFundsClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: "deadline" | "amount"
    order?: "asc" | "desc"
  } = {}
): Promise<ListFundsResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListFundsResult>(`/api/groups/${groupId}/funds${suffix}`)
}

export async function listMyFundsClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sortBy?: "deadline" | "amount"
    order?: "asc" | "desc"
  } = {}
): Promise<ListMyFundsResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListMyFundsResult>(`/api/groups/${groupId}/funds/me${suffix}`)
}

export async function listExpensesClient(
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
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListExpensesResult>(`/api/groups/${groupId}/expenses${suffix}`)
}

export async function listFundPaymentsClient(
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
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<{
    data: FundPayment[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>(`/api/groups/${groupId}/funds/${fundId}/payments${suffix}`)
}

export async function getGroupMembersClient(groupId: string): Promise<Member[]> {
  return fetchJson<Member[]>(`/api/groups/${groupId}/members`)
}