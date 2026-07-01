"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import { SubscriptionService } from "../api/subscriptions-service"

export interface SubscriptionActionState {
  error?: string
  success?: boolean
  paymentUrl?: string
}

export async function subscribeToPlanAction(
  planId: string
): Promise<SubscriptionActionState> {
  try {
    const result = await SubscriptionService.subscribeToPlan(planId)
    return { success: true, paymentUrl: result.paymentUrl }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Đăng ký gói thất bại. Vui lòng thử lại.",
      }
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra. Vui lòng thử lại.",
    }
  }
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<SubscriptionActionState> {
  try {
    await SubscriptionService.cancelMySubscription(subscriptionId)
    revalidatePath("/subscriptions")
    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Hủy gói đăng ký thất bại. Vui lòng thử lại.",
      }
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra. Vui lòng thử lại.",
    }
  }
}
