"use server"

import type { CreateGroupPlaySessionInput } from "@/features/play-sessions/api/group-play-sessions-service"
import { createGroupPlaySession } from "@/features/play-sessions/api/group-play-sessions-service"

export async function createPlaySessionAction(
  groupId: string,
  input: CreateGroupPlaySessionInput
) {
  try {
    const session = await createGroupPlaySession(groupId, input)
    return { success: true, data: session }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tạo buổi chơi"
    return { success: false, error: errorMessage }
  }
}
