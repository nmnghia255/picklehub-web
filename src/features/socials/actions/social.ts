"use server"

import { SocialService } from "@/features/socials/api/social-service"

export async function publishSocial(social: string) {
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
