import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  Tournament,
  TournamentDetail,
  TournamentRequest,
  TournamentStatus,
} from "../types/tournament"

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

export const TournamentService = {
  createTournament: async (tournament: TournamentRequest) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Tournament>>(
      "/api/tournaments",
      tournament
    )
    return unwrapApiResponse(response.data)
  },

  getTournaments: async (status: string, page: number, limit: number) => {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    searchParams.append("page", page.toString())
    searchParams.append("limit", limit.toString())
    if (status && status != "") {
      searchParams.append("status", status)
    }

    const response = await axios.get<ApiResponse<Tournament[]>>(
      `/api/tournaments?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },

  getMyTournaments: async (role: string, page: number, limit: number) => {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    searchParams.append("page", page.toString())
    searchParams.append("limit", limit.toString())
    if (role && role != "") {
      searchParams.append("role", role)
    }

    const response = await axios.get<ApiResponse<Tournament[]>>(
      `/api/tournaments/my-tournament?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },

  getTournamentById: async (id: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentDetail>>(
      `/api/tournaments/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  updateTournament: async (id: string, tournament: TournamentRequest) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<ApiResponse<Tournament>>(
      `/api/tournaments/${id}`,
      tournament
    )
    return unwrapApiResponse(response.data)
  },

  deleteTournament: async (id: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<Tournament>>(
      `/api/tournaments/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  changeTournamentStatus: async (id: string, status: TournamentStatus) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<ApiResponse<Tournament>>(
      `/api/tournaments/${id}/status`,
      { status }
    )
    return unwrapApiResponse(response.data)
  },
}
