"use server"

import axios from "axios"

import { PlaySessionService } from "../api/play-session-service"
import type { PlaySessionParticipant } from "../types/play-session"

export type JoinPlaySessionResult =
  | { success: true; data: PlaySessionParticipant }
  | { success: false; error: string }

export async function joinPlaySessionAction(
  socialId: string,
  sessionId: string
): Promise<JoinPlaySessionResult> {
  try {
    const data = await PlaySessionService.joinPlaySession(socialId, sessionId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to join play session:", error)
    // Surface the backend's message so the caller can show the specific reason
    // — e.g. the DUPR rating-gate rejection ("Your DUPR rating (…) is below
    // this session's minimum of …"). Empty string falls back to a generic
    // translated message client-side.
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}
