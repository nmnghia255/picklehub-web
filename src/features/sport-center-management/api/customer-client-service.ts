import type { CustomerListResponse } from "../types/customer"

interface ErrorPayload {
  message?: string
}

type ListCustomersParams = {
  centerId: string
  keyword?: string | null
  name?: string | null
  phone?: string | null
  email?: string | null
  lastVisitFrom?: string | null
  lastVisitTo?: string | null
  minSpend?: number | null
  maxSpend?: number | null
  limit?: number
  offset?: number
}

function normalizeListCustomersPayload(payload: unknown): CustomerListResponse {
  if (payload && typeof payload === "object") {
    if ("scope" in payload && "data" in payload && "pagination" in payload) {
      return payload as CustomerListResponse
    }

    if ("data" in payload) {
      const nested = (payload as { data?: unknown }).data
      if (
        nested &&
        typeof nested === "object" &&
        "scope" in nested &&
        "data" in nested &&
        "pagination" in nested
      ) {
        return nested as CustomerListResponse
      }
    }
  }

  return {
    scope: { centerId: null, centers: [] },
    data: [],
    pagination: { total: 0, limit: 20, offset: 0 },
  }
}

export const CustomerService = {
  listCustomers: async function listCustomers({
    centerId,
    keyword,
    name,
    phone,
    email,
    lastVisitFrom,
    lastVisitTo,
    minSpend,
    maxSpend,
    limit = 20,
    offset = 0,
  }: ListCustomersParams): Promise<CustomerListResponse> {
    const searchParams = new URLSearchParams()
    if (keyword) searchParams.set("keyword", keyword)
    if (name) searchParams.set("name", name)
    if (phone) searchParams.set("phone", phone)
    if (email) searchParams.set("email", email)
    if (lastVisitFrom) searchParams.set("lastVisitFrom", lastVisitFrom)
    if (lastVisitTo) searchParams.set("lastVisitTo", lastVisitTo)
    if (minSpend != null) searchParams.set("minSpend", String(minSpend))
    if (maxSpend != null) searchParams.set("maxSpend", String(maxSpend))
    searchParams.set("limit", String(limit))
    searchParams.set("offset", String(offset))

    const response = await fetch(
      `/api/sport-centers/${centerId}/customers/list?${searchParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const payload = (await response.json().catch(() => ({}))) as
      | ErrorPayload
      | CustomerListResponse
      | { data?: unknown }

    if (!response.ok) {
      throw new Error(payload.message || "Không thể tải danh sách khách hàng")
    }

    return normalizeListCustomersPayload(payload)
  },
}
