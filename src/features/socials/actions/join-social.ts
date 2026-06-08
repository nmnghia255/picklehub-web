"use server"

import { PlaySessionService } from "../api/play-session-service"
import { SocialService } from "../api/social-service"
import type { SocialParticipant } from "../types/social"

export async function joinSocialAction(
  socialId: string,
  isFullPackage: boolean,
  playSessionIds?: string[]
): Promise<SocialParticipant> {
  // First join the social event
  const participant = await SocialService.joinSocial(socialId, isFullPackage)

  // Then join the specific play sessions if it's not a full package
  if (!isFullPackage && playSessionIds && playSessionIds.length > 0) {
    await Promise.all(
      playSessionIds.map((sessionId) =>
        PlaySessionService.joinPlaySession(socialId, sessionId)
      )
    )
  }
  return participant
}
