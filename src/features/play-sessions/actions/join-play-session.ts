"use server"

import { joinGroupPlaySession } from "@/features/play-sessions/api/group-play-sessions-service"

export async function joinPlaySessionAction(
  groupId: string,
  playSessionId: string
) {
  try {
    const result = await joinGroupPlaySession(groupId, playSessionId)
    return { success: true, data: result }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tham gia buổi chơi"
    return { success: false, error: errorMessage }
  }
}
