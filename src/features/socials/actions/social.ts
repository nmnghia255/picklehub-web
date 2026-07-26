"use server"

import { SocialService } from "@/features/socials/api/social-service"

export async function publishSocial(social: string) {
  const socialDetail = await SocialService.getSocial(social)

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

  return await SocialService.publishSocial(social)
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
