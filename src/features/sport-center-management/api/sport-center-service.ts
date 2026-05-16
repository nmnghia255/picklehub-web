"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export type SportCenter = {
  id: string
  name: string
  location?: string
  owner?: string
}

export async function listOwnerSportCenters(): Promise<SportCenter[]> {
  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<SportCenter[]>("/api/sport-centers/me")

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("[SportCenterService] listOwnerSportCenters error:", error)
    return []
  }
}
