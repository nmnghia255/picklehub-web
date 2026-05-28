import { getAuthenticatedAxios } from "@/lib/server-api"

import type { CancellationPolicy } from "../types/cancellation-policy"
import type {
  AddPriceSlotRequest,
  PriceSlot,
  UpdatePriceSlotRequest,
} from "../types/price-slot"
import type {
  SportCenter,
  UpdateSportCenterRequest,
} from "../types/sport-center"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset: number
    limit: number
  }
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const SportCenterOwnerService = {
  listOwnerSportCenters: async function listOwnerSportCenters(): Promise<
    SportCenter[]
  > {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<SportCenter[]>("/api/sport-centers/me")

    return unwrapApiResponse(response.data)
  },

  getSportCenterDetails: async function getSportCenterDetails(
    centerId: string
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<SportCenter>(
      `/api/sport-centers/${centerId}`
    )
    return unwrapApiResponse(response.data)
  },

  updateSportCenter: async function updateSportCenter(
    centerId: string,
    request: UpdateSportCenterRequest
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<SportCenter>(
      `/api/sport-centers/${centerId}`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  deleteSportCenter: async function deleteSportCenter(
    centerId: string
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<SportCenter>(
      `/api/sport-centers/${centerId}`
    )
    return unwrapApiResponse(response.data)
  },

  addPriceSlot: async function addPriceSlot(
    centerId: string,
    priceSlot: AddPriceSlotRequest
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots`,
      priceSlot
    )
    return unwrapApiResponse(response.data)
  },

  updatePriceSlot: async function updatePriceSlot(
    centerId: string,
    priceSlot: UpdatePriceSlotRequest
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots`,
      priceSlot
    )
    return unwrapApiResponse(response.data)
  },

  deletePriceSlot: async function deletePriceSlot(
    centerId: string,
    priceSlotId: string
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots/${priceSlotId}`
    )
    return unwrapApiResponse(response.data)
  },

  getCancellationPolicy: async function getCancellationPolicy(
    centerId: string
  ): Promise<CancellationPolicy> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`
    )
    return unwrapApiResponse(response.data)
  },

  updateCancellationPolicy: async function updateCancellationPolicy(
    centerId: string,
    policy: CancellationPolicy
  ): Promise<CancellationPolicy> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`,
      policy
    )
    return unwrapApiResponse(response.data)
  },
}
