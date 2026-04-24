export interface User {
  id: string
  fullName: string
  avatarUrl?: string
  bio?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  selfRating: number
  preferredHand: "RIGHT" | "LEFT" | "AMBIDEXTROUS"
  dupr?: DuprProfile
}

export interface DuprProfile {
  duprId: string
  rating: number
  singlesRating: number
  doublesRating: number
  lastSyncedAt?: string
}

export interface UpdateProfileRequest {
  fullName?: string
  avatarUrl?: string | null
  bio?: string | null
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  preferredHand?: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
}
