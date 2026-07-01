export interface Player {
  id: number
  name: string
  rating: number
  avatar?: string
}

export interface Team {
  teamId: number
  name?: string
  seed: number
  rating: number
  player1?: Player
  player2?: Player | null
  avgRating?: number | null
}

export interface Bracket {
  id: number
  round: string
  bracketPosition: number
  nextMatchId: number
  loserMatchId: number
  stage: string
  externalMatchId: Record<string, unknown>
  status: string
  winner: string | null
  score: string | null
  team1: Team
  team2: Team
}

export interface EditBracketRequest {
  matches: {
    id: number
    team1Id: number
    team2Id: number
  }[]
}
