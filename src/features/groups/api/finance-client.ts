import type { Member } from "../types"
import type {
  FinanceSummary,
  ListCreditBalancesResult,
  ListExpensesResult,
  ListGroupDebtsResult,
  ListTransactionsResult,
  MyDebt,
  TransactionStatus,
} from "../types/finance"

type QueryParams = Record<string, string | number | boolean | null | undefined>

type FetchJsonError = Error & {
  status?: number
  data?: unknown
  url?: string
}

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
    const payloadMessage = (() => {
      if (!payload || typeof payload !== "object") {
        return null
      }

      const message = (payload as { message?: unknown }).message
      if (typeof message === "string") {
        return message
      }

      if (Array.isArray(message)) {
        return message
          .map((item) => (typeof item === "string" ? item : null))
          .filter(Boolean)
          .join(", ")
      }

      return null
    })()

    const error = new Error(
      payloadMessage || "Không thể tải dữ liệu tài chính."
    ) as FetchJsonError
    error.status = response.status
    error.data = payload
    error.url = url
    throw error
  }

  return (await response.json()) as T
}

export const financeQueryKeys = {
  group: (groupId: string) => ["group-finance", groupId] as const,
  members: (groupId: string) => ["group-finance", groupId, "members"] as const,
  summary: (groupId: string) => ["group-finance", groupId, "summary"] as const,
  transactions: (groupId: string) =>
    ["group-finance", groupId, "transactions"] as const,
  myDebt: (groupId: string) => ["group-finance", groupId, "my-debt"] as const,
  expenses: (groupId: string) =>
    ["group-finance", groupId, "expenses"] as const,
  creditBalances: (groupId: string) =>
    ["group-finance", groupId, "credit-balances"] as const,
  debts: (groupId: string, params?: QueryParams) =>
    ["group-finance", groupId, "debts", params] as const,
}

export async function listGroupDebtsClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    search?: string
  } = {}
): Promise<ListGroupDebtsResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListGroupDebtsResult>(
    `/api/groups/${groupId}/finances/debts${suffix}`
  )
}

export async function getFinanceSummaryClient(
  groupId: string,
  params: { fromDate?: string; toDate?: string } = {}
): Promise<FinanceSummary> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<FinanceSummary>(
    `/api/groups/${groupId}/finances/summary${suffix}`
  )
}

export async function listTransactionsClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    status?: TransactionStatus
  } = {}
): Promise<ListTransactionsResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListTransactionsResult>(
    `/api/groups/${groupId}/finances/transactions${suffix}`
  )
}

export async function getMyDebtClient(groupId: string): Promise<MyDebt> {
  return fetchJson<MyDebt>(`/api/groups/${groupId}/finances/me/debt`)
}

export async function listExpensesClient(
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
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListExpensesResult>(
    `/api/groups/${groupId}/expenses${suffix}`
  )
}

export async function listCreditBalancesClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    minCredit?: number
    userId?: string
  } = {}
): Promise<ListCreditBalancesResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<ListCreditBalancesResult>(
    `/api/groups/${groupId}/finances/credit-balances${suffix}`
  )
}

export async function getGroupMembersClient(
  groupId: string
): Promise<Member[]> {
  return fetchJson<Member[]>(`/api/groups/${groupId}/members`)
}
