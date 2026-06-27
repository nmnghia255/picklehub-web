export interface SponsorRequest {
  name: string
  logoUrl?: string | null
  amount: number
  websiteUrl?: string | null
}

export interface Sponsor {
  id: number | string
  tournamentId?: number
  name: string
  logoUrl: string | null
  amount: number
  websiteUrl: string | null
  createdAt: string
  updatedAt: string
}
