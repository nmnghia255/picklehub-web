"use server"

import { SocialService } from "../api/social-service"

export async function listSocialParticipantsAction(
  socialId: string,
  status?: string
) {
  return SocialService.listSocialParticipants(socialId, status)
}
