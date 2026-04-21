import type { AuthUser, LinkedProvider } from "@/features/auth/types"

export type User = AuthUser & {
  id: string
  fullName: string
  avatarUrl?: string
  bio?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  selfRating: number
  preferredHand: "RIGHT" | "LEFT" | "AMBIDEXTROUS"
  DuprProfile?: DuprProfile
}

export type DuprProfile = {
  id: string
  userId: string
  duprId: string
  rating: number
  singlesRating: number
  doublesRating: number
}
