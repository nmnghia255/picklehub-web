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

export type TournamentAuditAction =
  | "SEED_GENERATE"
  | "SEED_LOCK"
  | "BRACKET_GENERATE"
  | "BRACKET_LOCK"
  | "BRACKET_DELETE"

export interface TournamentAuditLog {
  id: number
  action: TournamentAuditAction
  oldValue: AuditLogValue | null
  newValue: AuditLogValue | null
  createdAt: string
  tournamentId: number
}

export type AuditLogValue =
  | SeedGenerateValue
  | SeedLockValue
  | BracketGenerateValue
  | BracketLockValue
  | BracketDeleteValue

export interface SeedGenerateValue {
  eventId: number
  seeds: TournamentSeed[]
}

export interface SeedLockValue {
  eventId: number
  status: "locked" | "unlocked"
}

export interface BracketGenerateValue {
  eventId: number
  format: "single_elimination" | "round_robin"
  matchesCount: number
}

export interface BracketLockValue {
  eventId: number
  status: "locked" | "unlocked"
}

export interface BracketDeleteValue {
  eventId: number
  deletedMatchesCount: number
}

export interface TournamentSeed {
  seed: number
  wins: number
  losses: number
  rating: number
  status: "locked" | "unlocked"
  teamId: number
  eventId: number
  teamName: string
  tournamentId: number
}
