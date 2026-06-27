export type RewardType = "cash" | "physical" | "voucher" | "other"

export interface TournamentPrizeRequest {
  name: string
  rewardType: RewardType | string
  value: number
  description?: string | null
  eventId?: number | string | null
  localEventId?: string | number | null
}

export interface Prize {
  id: number
  tournamentId: number
  eventId: number | null
  name: string
  rewardType: string
  value: number
  description: string | null
  winnerTeamId: number | null
  createdAt: string
  updatedAt: string
}

export type TournamentPrize = Prize
