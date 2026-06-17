import type { TournamentEvent } from "./tournament-event"
export type { TournamentEvent }

export type TournamentStatus =
  | "draft"
  | "published"
  | "open_registration"
  | "in_progress"
  | "completed"

export interface TournamentRequest {
  name: string
  venue: string
  startDate: string
  endDate: string
  capacity: number
  banner: string
}

export interface Tournament extends TournamentRequest {
  id: number
  status: TournamentStatus
  organizerId?: string
  createAt?: string
  updateAt?: string
  registered?: number
}

export interface TournamentDetail extends Tournament {
  events: TournamentEvent[]
}
