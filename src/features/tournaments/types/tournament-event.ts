export type TournamentEventStatus = "open" | "full"
export type TournamentEventType = "Singles" | "Doubles" | "Team"
export type TournamentEventGender = "Men" | "Women" | "Mixed"

export interface TournamentEventRequest {
  name: string
  type: TournamentEventType
  skillRange: string
  gender: TournamentEventGender
  capacity: number
  entryFee: number
}

export interface TournamentEvent extends TournamentEventRequest {
  id: number
  status: TournamentEventStatus
  tournamentId?: string
  participants?: number
}
