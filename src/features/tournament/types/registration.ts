import type { Player } from "./player"

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "withdrawn"

export interface Registration {
  id: number
  player: Player
  partner?: Player | null
  event: string
  paymentStatus: "completed" | "pending"
  registrationDate: string
  status: RegistrationStatus
}
