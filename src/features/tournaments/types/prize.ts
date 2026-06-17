export type RewardType = "cash" | "physical" | "voucher" | "other"

export interface TournamentPrizeRequest {
  name: string
  rewardType: RewardType
  value: number
  description: string
  eventId: number
}

export interface TournamentPrize extends TournamentPrizeRequest {
  id: string
  tournamentId: string
  winnerTeamId: string
  createAt: string
  updateAt: string
}
