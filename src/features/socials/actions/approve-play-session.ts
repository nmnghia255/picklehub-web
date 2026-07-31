"use server"

import { revalidatePath } from "next/cache"

import { PlaySessionService } from "../api/play-session-service"

export async function approveSessionParticipantAction(
  socialId: string,
  sessionId: string,
  participantId: string
) {
  const result = await PlaySessionService.approveSessionParticipant(
    socialId,
    sessionId,
    participantId
  )
  revalidatePath(`/socials/${socialId}/play-sessions/${sessionId}`)
  return result
}
