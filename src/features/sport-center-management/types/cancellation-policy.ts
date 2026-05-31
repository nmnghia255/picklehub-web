export interface CancellationPolicy {
  centerId: string
  allowCancellation: boolean
  tiers: Tier[]
}

export interface Tier {
  id: string
  centerId: string
  minDaysBeforeStart: number
  refundPercent: number
}

export interface UpdateCancellationPolicyRequest {
  allowCancellation: boolean
  tiers: {
    minDaysBeforeStart: number
    refundPercent: number
  }[]
}
