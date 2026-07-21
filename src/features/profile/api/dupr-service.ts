import { getAuthenticatedAxios } from "@/lib/server-api"

// #region Rating-service contracts

/**
 * A single DUPR rating snapshot as returned by rating-service.
 * `singles` / `doubles` are `null` while the player is NR (not rated yet).
 */
export interface DuprRatingDetail {
  userId: string | null
  duprId: string
  singles: number | null
  doubles: number | null
  singlesProvisional: boolean
  doublesProvisional: boolean
  singlesReliability: number
  doublesReliability: number
  updatedAt: string
}

/** `GET /api/ratings/me` — the caller's DUPR link + live rating. */
export interface MyDuprRating {
  linked: boolean
  duprId?: string
  linkedAt?: string
  rating?: DuprRatingDetail
}

/** `POST /api/ratings/invite` — provision a fresh provisional account and link it. */
export interface InviteDuprPayload {
  fullName: string
  email: string
  isoCode?: string
  phone?: string
}

// #endregion

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * rating-service returns bare DTOs, but stay defensive in case a response is
 * ever wrapped in the shared `{ success, message, data }` envelope.
 */
function unwrap<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

export async function getMyDuprRating(): Promise<MyDuprRating> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<MyDuprRating> | MyDuprRating>(
    "/api/ratings/me"
  )
  return unwrap(response.data)
}

export async function inviteDupr(
  payload: InviteDuprPayload
): Promise<MyDuprRating> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiResponse<MyDuprRating> | MyDuprRating>(
    "/api/ratings/invite",
    payload
  )
  return unwrap(response.data)
}

export async function unlinkDupr(): Promise<{ linked: boolean }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<
    ApiResponse<{ linked: boolean }> | { linked: boolean }
  >("/api/ratings/link")
  return unwrap(response.data)
}
