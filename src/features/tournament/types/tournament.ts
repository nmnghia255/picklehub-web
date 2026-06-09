export type TournamentStatus =
  | "draft"
  | "published"
  | "open_registration"
  | "in_progress"
  | "completed"
export type EventStatus = "open" | "full"

export interface Tournament {
  id: number
  name: string
  venue: string
  startDate: string
  endDate: string
  registered: number
  capacity: number
  status: TournamentStatus
  banner: string
}

export interface TournamentEvent {
  id: number
  name: string
  type: "Singles" | "Doubles" | "Team"
  skillRange: string
  gender: "Men" | "Women" | "Mixed"
  participants: number
  capacity: number
  entryFee: number
  status: EventStatus
}
