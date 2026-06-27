import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  RegistrationRequest,
  RegistrationResponse,
} from "../types/registration"

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

export const TournamentRegistrationService = {
  registerTournamentEvent: async (
    tournamentId: string,
    eventId: string,
    registration: RegistrationRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/events/${eventId}/registrations`,
      registration
    )
    return unwrapApiResponse(response.data)
  },

  listTournamentEventRegistrations: async (
    tournamentId: string,
    eventId: string,
    status: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const filterParams = new URLSearchParams()
    if (status) {
      filterParams.append("status", status)
    }
    if (eventId) {
      filterParams.append("eventId", eventId)
    }

    const response = await axios.get<RegistrationResponse[]>(
      `/api/tournaments/${tournamentId}/registrations${filterParams.toString() ? "?" + filterParams.toString() : ""}`
    )
    return unwrapApiResponse(response.data)
  },

  getRegistration: async (tournamentId: string, registrationId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}`
    )
    return unwrapApiResponse(response.data)
  },

  deleteRegistration: async (tournamentId: string, registrationId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}`
    )
    return unwrapApiResponse(response.data)
  },

  updateRegistrationStatus: async (
    tournamentId: string,
    registrationId: string,
    status: string,
    paymentStatus: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}/status`,
      { status, paymentStatus }
    )
    return unwrapApiResponse(response.data)
  },

  confirmPayment: async (
    tournamentId: string,
    registrationId: string,
    status: string,
    paymentStatus: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}/payment`,
      { status, paymentStatus }
    )
    return unwrapApiResponse(response.data)
  },

  uploadPaymentProof: async (
    tournamentId: string,
    registrationId: string,
    paymentProofUrl: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<RegistrationResponse>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}/pay`,
      { paymentProofUrl }
    )
    return unwrapApiResponse(response.data)
  },
}
