"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import { SocialService } from "@/features/socials/api/social-service"

export async function updateSocialBookingsAction(
  socialId: string,
  bookingIds: string[]
) {
  if (!bookingIds || bookingIds.length === 0) {
    throw new Error("Sự kiện Social phải chứa ít nhất 1 booking sân.")
  }
  const result = await SocialService.updateSocial(socialId, { bookingIds })
  revalidatePath(`/socials/${socialId}`)
  return result
}

function getPublishErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data as
      | { message?: string; error?: string }
      | string
      | undefined

    const serverMessage =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || ""

    const normalizedMessage = String(serverMessage || "").toLowerCase()

    if (status === 400) {
      if (
        normalizedMessage.includes("session") ||
        normalizedMessage.includes("play session")
      ) {
        return "Bạn phải tạo ít nhất một phiên chơi trước khi đăng sự kiện."
      }

      if (
        normalizedMessage.includes("payment") ||
        normalizedMessage.includes("price") ||
        normalizedMessage.includes("bank") ||
        normalizedMessage.includes("account")
      ) {
        return "Vui lòng cập nhật đầy đủ thông tin thanh toán (tên ngân hàng, số tài khoản, chủ tài khoản) trước khi công khai sự kiện."
      }

      return "Không thể đăng sự kiện lúc này. Vui lòng kiểm tra thông tin và thử lại."
    }
  }

  return error instanceof Error
    ? error.message
    : "Không thể đăng sự kiện lúc này."
}

export async function publishSocial(social: string) {
  const socialDetail = await SocialService.getSocial(social)

  const hasPlaySessions =
    Array.isArray(socialDetail.playSessions) &&
    socialDetail.playSessions.length > 0

  if (!hasPlaySessions) {
    throw new Error(
      "Bạn phải tạo ít nhất một phiên chơi trước khi đăng sự kiện."
    )
  }

  const hasPaymentInfo =
    socialDetail.isFree ||
    Boolean(
      socialDetail.paymentBankName?.trim() &&
      socialDetail.paymentAccountNumber?.trim() &&
      socialDetail.paymentAccountName?.trim()
    )

  if (!hasPaymentInfo) {
    throw new Error(
      "Vui lòng cập nhật đầy đủ thông tin thanh toán (tên ngân hàng, số tài khoản, chủ tài khoản) trước khi công khai sự kiện."
    )
  }

  try {
    return await SocialService.publishSocial(social)
  } catch (error) {
    throw new Error(getPublishErrorMessage(error))
  }
}

export async function completeSocial(social: string) {
  return await SocialService.completeSocial(social)
}

export async function submitFeedbackAction(
  socialId: string,
  ratingOverall: number,
  ratingOrganization: number,
  ratingVenue: number,
  comment: string
) {
  return await SocialService.submitFeedback(
    socialId,
    ratingOverall,
    ratingOrganization,
    ratingVenue,
    comment
  )
}

export async function getFeedbackAction(socialId: string) {
  return await SocialService.getFeedback(socialId)
}
