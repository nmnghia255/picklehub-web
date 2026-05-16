"use server"

import type {
  Court,
  CourtEnvelopeResponse,
  ListCenterCourtsResult,
  PaginatedCourtResponse,
} from "@/features/sport-center-management/types"
import { getAuthenticatedAxios } from "@/lib/server-api"

function unwrapCourtsResponse(
  payload: Court[] | CourtEnvelopeResponse | PaginatedCourtResponse
): ListCenterCourtsResult {
  if (Array.isArray(payload)) {
    return { courts: payload }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    const courts = payload.data as Court[]

    if ("meta" in payload && payload.meta) {
      return {
        courts,
        meta: payload.meta,
      }
    }

    return { courts }
  }

  return { courts: [] }
}

export async function listCenterCourts(
  centerId: string
): Promise<ListCenterCourtsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    Court[] | PaginatedCourtResponse | CourtEnvelopeResponse
  >(`/api/sport-centers/${centerId}/courts`)

  return unwrapCourtsResponse(response.data)
}
