"use server"

import { FinanceService } from "../api/finance-service"
import type { ApplyPriceRequest, SuggestedPriceRequest } from "../types/finance"

export async function calculateSuggestedPricingAction(
  socialId: string,
  request: SuggestedPriceRequest
) {
  return FinanceService.calculateSuggestedPricing(socialId, request)
}

export async function applyPriceAction(
  socialId: string,
  request: ApplyPriceRequest
) {
  return FinanceService.applyPrice(socialId, request)
}

export async function getFinanceSummaryAction(
  socialId: string,
  fromDate?: string,
  toDate?: string
) {
  return FinanceService.getFinanceSummary(socialId, fromDate, toDate)
}

export async function listCourtBookingsAction(socialId: string) {
  return FinanceService.listCourtBookings(socialId)
}

export async function listMembersAction(
  socialId: string,
  page: number,
  limit: number,
  minCredit: number,
  userId: string
) {
  return FinanceService.listMembers(socialId, page, limit, minCredit, userId)
}

export async function listStatisticsAction(socialId: string) {
  return FinanceService.listStatistics(socialId)
}
