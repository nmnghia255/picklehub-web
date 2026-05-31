import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CustomerDetailResponse,
  CustomerListResponse,
} from "../types/customer"

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

export const CustomerService = {
  listCustomers: async function listCustomers(
    centerId?: string,
    keyword?: string | null,
    name?: string | null,
    phone?: string | null,
    email?: string | null,
    lastVisitFrom?: string | null,
    lastVisitTo?: string | null,
    minSpend?: number | null,
    maxSpend?: number | null,
    limit: number = 20,
    offset: number = 0
  ): Promise<CustomerListResponse> {
    const axios = await getAuthenticatedAxios()
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

    const response = await axios.get(
      `/api/sport-centers/customers/list?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },

  getCustomerProfile: async function getCustomerProfile(
    customerId: string,
    centerId?: string | null
  ): Promise<CustomerDetailResponse> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (centerId) searchParams.set("centerId", centerId)
    const response = await axios.get(
      `/api/customers/${customerId}/profile?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },
}
