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
  phoneNumber: string
  preferredHand?: "RIGHT" | "LEFT" | "AMBIDEXTROUS" | null
  address: string
  name: string
}
