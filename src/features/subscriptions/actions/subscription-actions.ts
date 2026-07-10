"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import enSubscriptions from "@/i18n/locales/en/subscriptions.json"
import viSubscriptions from "@/i18n/locales/vi/subscriptions.json"

import { SubscriptionService } from "../api/subscriptions-service"

export interface SubscriptionActionState {
  error?: string
  success?: boolean
  paymentUrl?: string
}

function getSubscriptionLocale() {
  const acceptLanguage = headers().get("accept-language") ?? ""
  return acceptLanguage.toLowerCase().startsWith("vi")
    ? viSubscriptions
    : enSubscriptions
}

export async function subscribeToPlanAction(
  planId: string
): Promise<SubscriptionActionState> {
  const subs = getSubscriptionLocale()

  try {
    const result = await SubscriptionService.subscribeToPlan(planId)
    return { success: true, paymentUrl: result.paymentUrl }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || subs.errorOccurred,
      }
    }
    return {
      error: error instanceof Error ? error.message : subs.errorOccurred,
    }
  }
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<SubscriptionActionState> {
  const subs = getSubscriptionLocale()

  try {
    await SubscriptionService.cancelMySubscription(subscriptionId)
    revalidatePath("/subscriptions")
    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || subs.errorOccurred,
      }
    }
    return {
      error: error instanceof Error ? error.message : subs.errorOccurred,
    }
  }
}
