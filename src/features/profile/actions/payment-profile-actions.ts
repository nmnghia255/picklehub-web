"use server"

import axios from "axios"

import { PaymentProfileService } from "@/features/profile/api/payment-profile-service"
import type {
  PaymentProfile,
  PaymentProfileRequest,
} from "@/features/profile/types"

export interface PaymentProfileActionState {
  success?: boolean
  error?: string
  message?: string
  paymentProfile?: PaymentProfile
}

export async function getPaymentProfilesAction(): Promise<PaymentProfile[]> {
  try {
    const res = await PaymentProfileService.getPaymentProfile()
    if (!res) return []
    if (Array.isArray(res)) return res
    return [res]
  } catch (error) {
    console.error("Error fetching payment profiles:", error)
    return []
  }
}

export async function createPaymentProfileAction(
  payload: PaymentProfileRequest
): Promise<PaymentProfileActionState> {
  try {
    const paymentProfile =
      await PaymentProfileService.createPaymentProfile(payload)
    return { success: true, paymentProfile }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || "paymentProfile.error" }
    }
    return { error: "paymentProfile.error" }
  }
}

export async function updatePaymentProfileAction(
  payload: PaymentProfileRequest,
  id?: string
): Promise<PaymentProfileActionState> {
  try {
    const paymentProfile = await PaymentProfileService.updatePaymentProfile(
      payload,
      id
    )
    return { success: true, paymentProfile }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || "paymentProfile.error" }
    }
    return { error: "paymentProfile.error" }
  }
}

export async function removePaymentProfileAction(
  id: string
): Promise<PaymentProfileActionState> {
  try {
    await PaymentProfileService.removePaymentProfile(id)
    return { success: true }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || "paymentProfile.error" }
    }
    return { error: "paymentProfile.error" }
  }
}
