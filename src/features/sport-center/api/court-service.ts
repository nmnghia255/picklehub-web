import "server-only"

import type {
  BulkCourtAvailability,
  Court,
  CourtResponse,
} from "@/features/sport-center/types/court"
import { getAuthenticatedAxios } from "@/lib/server-api"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const CourtService = {
  getCourts: async (centerId: string): Promise<CourtResponse[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<CourtResponse[]> | CourtResponse[]
    >(`/api/sport-centers/${centerId}/courts`)
    return unwrapApiResponse(response.data)
  },

  getCourtAvailability: async (
    centerId: string,
    courtId: string,
    date: string
  ): Promise<CourtResponse[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<CourtResponse[]> | CourtResponse[]
    >(
      `/api/sport-centers/${centerId}/courts/${courtId}/availability?date=${date}`
    )
    return unwrapApiResponse(response.data)
  },

  getBulkCourtAvailability: async (
    centerId: string,
    date: string
  ): Promise<BulkCourtAvailability> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<
      ApiResponse<BulkCourtAvailability> | BulkCourtAvailability
    >(`/api/sport-centers/${centerId}/availability?date=${date}`)
    return unwrapApiResponse(response.data)
  },
}
