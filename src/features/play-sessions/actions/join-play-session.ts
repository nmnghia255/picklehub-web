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
    const paymentReceiptUrl = String(
      formData.get("paymentReceiptUrl") ?? ""
    ).trim()

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

    if (!paymentReceiptUrl) {
      return {
        success: false,
        error: "Vui lòng nhập link biên lai thanh toán.",
      }
    }

    const result = await joinGroupPlaySession(groupId, playSessionId, {
      guestsCount,
      paymentReceiptUrl,
    })
    return { success: true, data: result }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tham gia buổi chơi"
    return { success: false, error: errorMessage }
  }
}
