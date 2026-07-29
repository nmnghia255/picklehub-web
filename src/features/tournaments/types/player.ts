export interface Player {
  id?: string | number
  userId?: string | number
  name: string
  rating: number
  avatar?: string
  age?: number
  gender?: string
  duprId?: string | null
  event?: string
}

export interface Team {
  id: number
  tournamentId?: number
  eventId?: number
  player1: Player
  player2: Player | null
  avgRating: number | null
  matchScore?: number
}

export interface AutoMatchTeam {
  matchedTeamsCount: number
  teams: Team[]
}

export interface UnmatchedTeam {
  id: string
  tournamentId: string
  eventId: string
  player: Player
  partner: Player
  event: string
  paymentStatus: "pending" | "paid"
  paymentProofUrl: string
  paymentProofUploadedAt: string
  status: string
  registrationDate: string
}
