import type { TournamentEvent } from "./tournament-event"
export type { TournamentEvent }

export type TournamentStatus =
  | "draft"
  | "published"
  | "closed_registration"
  | "open_registration"
  | "in_progress"
  | "completed"

export interface TournamentRequest {
  name: string
  venue: string
  startDate: string
  endDate: string
  capacity: number
  banner: string | null
  description: string | null
  registrationStartDate: string | null
  registrationEndDate: string | null
  paymentBankName: string | null
  paymentAccountName: string | null
  paymentAccountNumber: string | null
  paymentQrUrl?: string | null
  paymentNote?: string | null
  centerIds?: string[]
}

export interface Tournament {
  id: number
  uuid: string
  organizerId?: string | null
  name: string
  venue: string
  startDate: string
  endDate: string
  registered: number
  capacity: number
  status: TournamentStatus
  banner: string | null
  description: string | null
  registrationStartDate: string | null
  registrationEndDate: string | null
  paymentBankName: string | null
  paymentAccountName: string | null
  paymentAccountNumber: string | null
  paymentQrUrl?: string | null
  paymentNote?: string | null
  centerIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface TournamentDetail extends Tournament {
  events: TournamentEvent[]
}
