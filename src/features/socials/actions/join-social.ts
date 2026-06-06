"use server"

import { SocialService } from "../api/social-service"
import type { SocialParticipant } from "../types/social"

export async function joinSocialAction(
  socialId: string,
  playSessionIds?: string[]
): Promise<SocialParticipant> {
  return SocialService.joinSocial(socialId, playSessionIds)
}
