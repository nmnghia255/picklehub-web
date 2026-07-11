import type { Player } from "./player"

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "withdrawn"

export type PaymentStatus = "pending" | "verifying" | "completed"
export type TransactionStatus = "pending" | "verifying" | "completed"

export interface RegistrationRequest {
  playerId: string
  playerName: string
  playerRating?: number
  playerAvatar?: string
  playerGender: "M" | "F"
  playerAge: number
  partnerId?: string
  partnerName?: string
  partnerRating?: number
  partnerAvatar?: string
  partnerGender?: "M" | "F"
  partnerAge?: number
  paymentStatus: PaymentStatus
  playerDuprId?: string
  partnerDuprId?: string
}

export interface RegistrationResponse {
  id: string
  tournamentId: string
  eventId: string
  player: Player
  partner: Player
  event: string
  paymentStatus: string
  paymentProofUrl: string
  paymentProofUploadedAt: string
  status: RegistrationStatus
  registrationDate: string
}

export interface Registration {
  id: number | string
  tournamentId?: number
  eventId?: number
  player: Player
  partner: Player | null
  event: string
  paymentStatus: string
  paymentProofUrl?: string | null
  paymentProofUploadedAt?: string | null
  status: RegistrationStatus
  registrationDate: string
}

export interface PaymentSubmit {
  paymentProofUrl: string
}
