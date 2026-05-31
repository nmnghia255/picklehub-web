import type { CustomerListResponse } from "../types/customer"
import type { CustomerDetailResponse } from "../types/customer"

interface ErrorPayload {
  message?: string
}

type ListCustomersParams = {
  centerId?: string | null
  keyword?: string | null
  name?: string | null
  phone?: string | null
  email?: string | null
  lastVisitFrom?: string | null
  lastVisitTo?: string | null
  minSpend?: number | null
  maxSpend?: number | null
  limit: number
  offset: number
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

function normalizeCustomerDetailPayload(
  payload: unknown
): CustomerDetailResponse {
  if (payload && typeof payload === "object") {
    if (
      "scope" in payload &&
      "customer" in payload &&
      "summary" in payload &&
      "byCenter" in payload &&
      "recentBookings" in payload &&
      "creditWallets" in payload
    ) {
      return payload as CustomerDetailResponse
    }

    if ("data" in payload) {
      const nested = (payload as { data?: unknown }).data
      if (
        nested &&
        typeof nested === "object" &&
        "scope" in nested &&
        "customer" in nested &&
        "summary" in nested &&
        "byCenter" in nested &&
        "recentBookings" in nested &&
        "creditWallets" in nested
      ) {
        return nested as CustomerDetailResponse
      }
    }
  }

  return {
    scope: { centerId: null, centers: [] },
    customer: {
      id: "",
      name: "",
      email: "",
      avatarUrl: null,
      phoneNumber: "",
    },
    summary: {
      visitCount: 0,
      completedVisitCount: 0,
      confirmedVisitCount: 0,
      pendingVisitCount: 0,
      cancelledVisitCount: 0,
      totalSpend: 0,
      cancelledSpend: 0,
      creditBalance: 0,
      cancelledRefundAmount: 0,
      firstVisitAt: null,
      lastVisitAt: null,
    },
    byCenter: [],
    recentBookings: [],
    creditWallets: [],
  }
}

export const CustomerService = {
  listCustomers: async function listCustomers(
    params?: ListCustomersParams
  ): Promise<CustomerListResponse> {
    const {
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
    } = params ?? {}

    const searchParams = new URLSearchParams()
    if (centerId) searchParams.set("centerId", centerId)
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
      `/api/sport-centers/customers/list?${searchParams.toString()}`,
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
      const message =
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as ErrorPayload).message === "string"
          ? (payload as ErrorPayload).message
          : "Không thể tải danh sách khách hàng"

      throw new Error(message)
    }

    return normalizeListCustomersPayload(payload)
  },

  getCustomerDetail: async function getCustomerDetail(
    customerId: string
  ): Promise<CustomerDetailResponse> {
    const response = await fetch(`/api/sport-centers/customers/${customerId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const payload = (await response.json().catch(() => ({}))) as
      | ErrorPayload
      | CustomerDetailResponse
      | { data?: unknown }

    if (!response.ok) {
      const message =
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as ErrorPayload).message === "string"
          ? (payload as ErrorPayload).message
          : "Không thể tải chi tiết khách hàng"

      throw new Error(message)
    }

    return normalizeCustomerDetailPayload(payload)
  },
}
