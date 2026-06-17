export interface Player {
  id?: number
  name: string
  rating: number
  avatar?: string
  age?: number
  gender?: "M" | "F" | "Mixed"
  event?: string
}

export interface Team {
  id: number
  player1: Player
  player2?: Player
  matchScore?: number
  avgRating?: number
}
