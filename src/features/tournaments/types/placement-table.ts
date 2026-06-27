export interface FinalPlacementTable {
  position: number
  teamId: number
  name: string
  seed: number
  wins: number
  losses: number
  result: string
}

export interface FinalPlacementTableResponse {
  data: FinalPlacementTable[]
  meta: {
    total: number
    championTeamId: number
    championTeamName: string
  }
}
