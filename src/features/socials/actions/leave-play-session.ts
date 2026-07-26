"use server"

import axios from "axios"

import { PlaySessionService } from "../api/play-session-service"
import type { PlaySessionParticipant } from "../types/play-session"

export type LeavePlaySessionResult =
  | { success: true; data: PlaySessionParticipant }
  | { success: false; error: string }

export async function leavePlaySessionAction(
  socialId: string,
  sessionId: string
): Promise<LeavePlaySessionResult> {
  try {
    const data = await PlaySessionService.leavePlaySession(socialId, sessionId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to leave play session:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}
