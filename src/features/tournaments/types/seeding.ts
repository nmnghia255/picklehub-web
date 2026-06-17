export interface Seed {
  seed: number
  team: string
  rating: number
  wins: number
  losses: number
  status: "locked" | "unlocked"
}
