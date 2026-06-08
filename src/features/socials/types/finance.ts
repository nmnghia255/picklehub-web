import type { User } from "./social"

export interface FinanceSummary {
  totalExpense: number
  participants: {
    joinedCount: number
    maxSlots: number
  }
  paidMembersCount: number
  collectedAmount: number
  outstandingAmount: number
  collectionProgress: number
  totalExpectedRevenue: number
  totalRefundAmount: number
  estimatedProfit: number
}

export interface FinanceMember {
  userId: string
  creditBalance: number
  status: string
  user: User
}

export interface CourtBookingExpense {
  id: string
  title: string
  startTime: string
  endTime: string
  location: string
  bookingIds: string[]
  numberOfCourts: number
  courtNames: string
  sessionFee: number
  bookingCost: number
}

export interface SuggestedPriceRequest {
  targetPlayers: number
  suggestedPackagePrice: number
  sessionOverrides: {
    sessionId: string
    suggestedPrice: number
  }[]
}

export interface SuggestedPriceSession {
  id: string
  title: string
  sessionFee: number
  bookingCost: number
  allocatedExpense: number
  breakEven: number
  suggestedPrice: number
}

export interface SuggestedPriceSummary {
  totalBookingCost: number
  totalManualExpenses: number
  totalExpense: number
  totalSessionsCount: number
  packageBreakEven: number
  suggestedPackagePrice: number
  sumSessionSuggestedPrices: number
  isWarning: boolean
  warningPackageBelowBreakEven: boolean
  warningPackageNotCheaperThanSessions: boolean
  simulatedPackageRevenue: number
  simulatedPackageProfit: number
  simulatedSessionsRevenue: number
  simulatedSessionsProfit: number
}

export interface SuggestedPriceResponse {
  inputs: SuggestedPriceRequest
  summary: SuggestedPriceSummary
  sessions: SuggestedPriceSession[]
}

export interface ApplyPriceRequest {
  packageFee: number
  sessionFees: {
    sessionId: string
    sessionFee: number
  }[]
}

export interface PlaySessionPrice {
  id: string
  title: string
  sessionFee: number
}

export interface ApplyPriceResponse {
  id: string
  title: string
  packageFee: number
  status: string
  playSessions: PlaySessionPrice[]
}
