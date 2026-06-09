export type CourtStatus = "occupied" | "available" | "maintenance"

export interface Court {
  id: number
  name: string
  status: CourtStatus
  match: string | null
  timeRemaining: string | null
}
