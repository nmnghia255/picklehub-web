export interface TournamentCenter {
  centerId: string
  name: string
  address: string
  status: string
  exists: boolean
  courts: TournamentCenterCourt[]
}

export interface TournamentCenterCourt {
  courtId: string
  name: string
  type: string
  status: string
}
