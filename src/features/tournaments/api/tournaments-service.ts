import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  Tournament,
  TournamentDetail,
  TournamentRequest,
  TournamentStatus,
} from "../types/tournament"

export interface PaginatedTournamentsResponse {
  data: Tournament[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset?: number
    page?: number
    limit: number
  }
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

function normalizePaginatedTournaments(
  unwrapped: unknown,
  page: number,
  limit: number
): PaginatedTournamentsResponse {
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    "data" in unwrapped &&
    Array.isArray((unwrapped as Record<string, unknown>).data)
  ) {
    const unwrappedObj = unwrapped as {
      data: Tournament[]
      meta?: {
        total: number
        page: number
        limit: number
        totalPages: number
      }
    }
    return {
      data: unwrappedObj.data,
      meta: unwrappedObj.meta || {
        total: unwrappedObj.data.length,
        page,
        limit,
        totalPages: Math.ceil(unwrappedObj.data.length / limit),
      },
    }
  }

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as Tournament[],
      meta: {
        total: unwrapped.length,
        page,
        limit,
        totalPages: Math.ceil(unwrapped.length / limit),
      },
    }
  }

  return {
    data: [],
    meta: {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
  }
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

  getTournaments: async (
    search: string,
    status: string,
    page: number,
    limit: number
  ): Promise<PaginatedTournamentsResponse> => {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (search && search != "") {
      searchParams.append("search", search)
    }
    if (status && status != "") {
      searchParams.append("status", status)
    }
    searchParams.append("page", page.toString())
    searchParams.append("limit", limit.toString())

    const response = await axios.get<ApiResponse<unknown>>(
      `/api/tournaments?${searchParams.toString()}`
    )
    return normalizePaginatedTournaments(
      unwrapApiResponse(response.data),
      page,
      limit
    )
  },

  getMyTournaments: async (
    role: string,
    page: number,
    limit: number
  ): Promise<PaginatedTournamentsResponse> => {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    searchParams.append("page", page.toString())
    searchParams.append("limit", limit.toString())
    if (role && role !== "" && role !== "all") {
      searchParams.append("role", role)
    }

    const response = await axios.get<ApiResponse<unknown>>(
      `/api/tournaments/my-tournaments?${searchParams.toString()}`
    )
    return normalizePaginatedTournaments(
      unwrapApiResponse(response.data),
      page,
      limit
    )
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
    const response = await axios.patch<ApiResponse<Tournament>>(
      `/api/tournaments/${id}/status`,
      { status }
    )
    return unwrapApiResponse(response.data)
  },

  discoverTournaments: async () => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Tournament[]>>(
      "/api/tournaments/discover"
    )
    return unwrapApiResponse(response.data)
  },
}
