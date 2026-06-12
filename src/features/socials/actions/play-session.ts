"use server"

import { PlaySessionService } from "@/features/socials/api/play-session-service"
import type { PlaySessionRequest } from "@/features/socials/types/play-session"

export async function createSocialPlaySessionAction(
  socialId: string,
  input: PlaySessionRequest
) {
  try {
    const session = await PlaySessionService.createPlaySession(socialId, input)
    return { success: true, data: session }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tạo buổi chơi"
    return { success: false, error: errorMessage }
  }
}

export async function startPlaySession(social: string, playSessionId: string) {
  return await PlaySessionService.startPlaySession(social, playSessionId)
}

export async function completePlaySession(
  social: string,
  playSessionId: string
) {
  return await PlaySessionService.completePlaySession(social, playSessionId)
}
