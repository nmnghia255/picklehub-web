export interface CancellationPolicy {
  centerId: string
  allowCancellation: boolean
  tiers: Tier[]
}

export interface UpdatedCancellationPolicy {
  id: string
  allowCancellation: boolean
  cancellationTiers: Tier[]
}

export interface CancellationTier {
  minDaysBeforeStart: number
  refundPercent: number
}

export interface Tier {
  id: string
  centerId: string
  minDaysBeforeStart: number
  refundPercent: number
}

export interface UpdateCancellationPolicyRequest {
  allowCancellation?: boolean
  tiers?: CancellationTier[]
}
