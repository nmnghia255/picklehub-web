import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Social } from "../types"

interface ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
  }
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const socialService = {
  listMySocials: async function (): Promise<Social[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social[]>>(
      "/api/events/socials/my-schedule"
    )
    return unwrapApiResponse(response.data)
  },
}
