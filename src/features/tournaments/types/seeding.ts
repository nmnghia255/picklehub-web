export interface Seed {
  seed: number
  teamId?: string
  team: string
  rating: number
  wins: number
  losses: number
  status: "locked" | "unlocked"
}

export interface ReorderSeedsRequest {
  seeds: {
    teamId?: string
    seed: number
  }[]
}
