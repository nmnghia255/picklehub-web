"use server"

import { joinGroupPlaySession } from "@/features/play-sessions/api/group-play-sessions-service"

export type JoinPlaySessionActionState = {
  success?: boolean
  error?: string
}

const MAX_GUESTS_COUNT = 5

export async function joinPlaySessionAction(
  groupId: string,
  playSessionId: string,
  _state: JoinPlaySessionActionState,
  formData: FormData
) {
  try {
    const guestsCount = Number(formData.get("guestsCount"))

    if (
      !Number.isInteger(guestsCount) ||
      guestsCount < 0 ||
      guestsCount > MAX_GUESTS_COUNT
    ) {
      return {
        success: false,
        error: `Số khách đi kèm phải từ 0 đến ${MAX_GUESTS_COUNT}.`,
      }
    }

    const result = await joinGroupPlaySession(groupId, playSessionId, {
      guestsCount,
    })
    return { success: true, data: result }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tham gia buổi chơi"
    return { success: false, error: errorMessage }
  }
}
