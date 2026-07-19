export type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
export type PlanType =
  | "SPORT_CENTER_MANAGER"
  | "GROUP_OWNER"
  | "SOCIAL_HOST"
  | "TOURNAMENT_ORGANIZER"
  | "COACH"
export type BillingCycles = "MONTHLY" | "QUARTERLY" | "YEARLY"

export interface AvailableSubscriptionPlan extends SubscriptionPlan {
  createdAt: string
  updatedAt: string
  isSubscribed: boolean
}

//=================

export interface SubscriptionPlan {
  id: string
  type: PlanType
  billingCycle: BillingCycles
  name: string
  description: string
  features: string[]
  priceVnd: number
  durationInDays: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  startDate: string
  endDate: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
  plan: SubscriptionPlan
}

//=================

export interface SubscriptionPayment {
  id: string
  subscriptionId: string
  userId: string
  amountVnd: number
  status: string
  vnpTxnRef: string
  vnpTransactionNo: string
  vnpBankCode: string
  vnpPayDate: string
  vnpResponseCode: string
  paidAt: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionDetail extends Subscription {
  payment: SubscriptionPayment
}

export interface SubscribeToPlanResponse {
  subscription: Subscription
  paymentUrl: string
}
