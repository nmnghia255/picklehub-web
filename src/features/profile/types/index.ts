export interface User {
  id: string
  fullName: string
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  phoneNumber: string
  selfRating: number
  address: string
  preferredHand: "RIGHT" | "LEFT" | "AMBIDEXTROUS"
  dupr?: DuprProfile
  hasPassword?: boolean
}

export interface DuprProfile {
  duprId: string
  // Ratings are null until DUPR has rated the player (NR — not rated yet).
  rating: number | null
  singlesRating: number | null
  doublesRating: number | null
  lastSyncedAt?: string
}

export interface UpdateProfileRequest {
  fullName?: string
  avatarUrl?: string | null
  bio?: string | null
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  selfRating: number
  phoneNumber: string
  preferredHand?: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
  address: string
  city: string
  district: string
  latitude: number
  longitude: number
}
