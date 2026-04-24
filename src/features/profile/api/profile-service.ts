import type { LinkedProvider } from "@/features/auth/types"
import { apiClient } from "@/lib/api-client"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { User } from "../types"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface UpdateMyProfilePayload {
  fullName: string
  avatarUrl: string | null
  bio: string | null
  gender: "MALE" | "FEMALE" | "OTHER" | null
  selfRating?: number
  preferredHand: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

export async function getMyProfile(): Promise<User> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<User> | User>("/api/users/me")
  return unwrapApiResponse(response.data)
}

export async function getMyLinkedProviders(): Promise<LinkedProvider[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<LinkedProvider[]>("/api/auth/social/linked")
  return response.data
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload
): Promise<User> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiResponse<User> | User>(
    "/api/users/me",
    payload
  )
  return unwrapApiResponse(response.data)
}

export async function getUserProfile(userId: string): Promise<User> {
  const response = await apiClient.get<ApiResponse<User> | User>(
    `/api/users/${userId}`
  )
  return unwrapApiResponse(response.data)
}
