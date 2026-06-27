import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Sponsor, SponsorRequest } from "../types/sponsor"

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

export const TournamentSponsorService = {
  addSponsor: async (sponsor: SponsorRequest, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Sponsor>>(
      `/api/tournaments/${tournamentId}/sponsors`,
      sponsor
    )
    return unwrapApiResponse(response.data)
  },

  getSponsors: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Sponsor[]>>(
      `/api/tournaments/${tournamentId}/sponsors`
    )
    return unwrapApiResponse(response.data)
  },

  getSponsorById: async (id: string, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Sponsor>>(
      `/api/tournaments/${tournamentId}/sponsors/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  updateSponsor: async (
    id: string,
    sponsor: SponsorRequest,
    tournamentId: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<ApiResponse<Sponsor>>(
      `/api/tournaments/${tournamentId}/sponsors/${id}`,
      sponsor
    )
    return unwrapApiResponse(response.data)
  },

  deleteSponsor: async (id: string, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<Sponsor>>(
      `/api/tournaments/${tournamentId}/sponsors/${id}`
    )
    return unwrapApiResponse(response.data)
  },
}
