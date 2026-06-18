"use server"

import { PlaySessionService } from "../api/play-session-service"
import type { PlaySessionParticipant } from "../types/play-session"

export async function joinPlaySessionAction(
  socialId: string,
  sessionId: string
): Promise<PlaySessionParticipant> {
  const result = await PlaySessionService.joinPlaySession(socialId, sessionId)
  return result
}
