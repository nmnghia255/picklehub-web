"use server"

import { createGroupPlaySession } from "@/features/play-sessions/api/group-play-sessions-service"
import { createPublicPlaySession } from "@/features/play-sessions/api/public-play-sessions-service"
import type { CreateGroupPlaySessionInput } from "@/features/play-sessions/types"

export async function createPlaySessionAction(
  groupId: string | null,
  input: CreateGroupPlaySessionInput
) {
  try {
    const session = groupId
      ? await createGroupPlaySession(groupId, input)
      : await createPublicPlaySession(input)
    return { success: true, data: session }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi khi tạo buổi chơi"
    return { success: false, error: errorMessage }
  }
}
