import type { AuthUser, LinkedProvider } from "@/features/auth/types"

export type ProfileDetails = AuthUser & {
  height?: number | null
  weight?: number | null
  level?: string | null
  playStyle?: string | null
  timeToPlay?: string | null
}

export type ProfilePageData = {
  user: ProfileDetails | null
  linkedProviders: LinkedProvider[]
  sessionUser: {
    id: string
    email: string
  }
}
