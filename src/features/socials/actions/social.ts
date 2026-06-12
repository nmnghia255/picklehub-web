"use server"

import { SocialService } from "@/features/socials/api/social-service"

export async function publishSocial(social: string) {
  return await SocialService.publishSocial(social)
}

export async function completeSocial(social: string) {
  return await SocialService.completeSocial(social)
}
