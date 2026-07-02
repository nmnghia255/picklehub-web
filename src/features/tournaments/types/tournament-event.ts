export type EventStatus = "open" | "full"
export type TournamentEventStatus = EventStatus
export type TournamentEventType = "Singles" | "Doubles" | "Team"
export type TournamentEventGender = "Men" | "Women" | "Mixed"
export type EventFormat =
  | "single_elimination"
  | "double_elimination"
  | "round_robin"

export interface TournamentEventRequest {
  name: string
  type: TournamentEventType
  skillRange: string
  gender: TournamentEventGender
  capacity: number
  entryFee: number
  format?: EventFormat
}

export interface TournamentEvent {
  id: number
  name: string
  type: TournamentEventType
  skillRange: string
  gender: TournamentEventGender
  participants?: number
  capacity: number
  entryFee: number
  status: EventStatus
  format?: EventFormat
  tournamentId?: number
  totalMatches?: number
}
