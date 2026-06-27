export interface CheckIn {
  id: number
  tournamentId: number
  registrationId: number
  player1CheckedIn: boolean
  player1CheckedInAt: string | null
  player2CheckedIn: boolean
  player2CheckedInAt: string | null
  createdAt: string
  updatedAt: string
}

export type Checkin = CheckIn
