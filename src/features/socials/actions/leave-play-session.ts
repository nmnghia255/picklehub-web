"use server"

import { PlaySessionService } from "../api/play-session-service"
import type { PlaySessionParticipant } from "../types/play-session"

export async function leavePlaySessionAction(
  socialId: string,
  sessionId: string
): Promise<PlaySessionParticipant> {
  const result = await PlaySessionService.leavePlaySession(socialId, sessionId)
  return result
}
