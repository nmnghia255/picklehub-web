import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Court, CourtRequest } from "../types/court"

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

export const CourtService = {
  listCenterCourts: async function listCenterCourts(
    centerId: string
  ): Promise<Court[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<Court[]>(
      `/api/sport-centers/${centerId}/courts`
    )
    return unwrapApiResponse(response.data)
  },

  createCourt: async function createCourt(
    centerId: string,
    courtData: CourtRequest
  ): Promise<Court> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Court>(
      `/api/sport-centers/${centerId}/courts`,
      courtData
    )
    return unwrapApiResponse(response.data)
  },

  updateCourt: async function updateCourt(
    centerId: string,
    courtId: string,
    courtData: CourtRequest
  ): Promise<Court> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<Court>(
      `/api/sport-centers/${centerId}/courts/${courtId}`,
      courtData
    )
    return unwrapApiResponse(response.data)
  },

  deleteCourt: async function deleteCourt(
    centerId: string,
    courtId: string
  ): Promise<Court> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<Court>(
      `/api/sport-centers/${centerId}/courts/${courtId}`
    )
    return unwrapApiResponse(response.data)
  },
}
