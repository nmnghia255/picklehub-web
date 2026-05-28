"use server"

import {
  addFavoriteSportCenter,
  removeFavoriteSportCenter,
} from "@/features/sport-center/api/sport-center-service"

export interface ToggleFavoriteSportCenterState {
  isFavourite: boolean
  message?: string
  error?: string
}

export async function toggleFavoriteSportCenterAction(
  _state: ToggleFavoriteSportCenterState,
  formData: FormData
): Promise<ToggleFavoriteSportCenterState> {
  const centerId = String(formData.get("centerId") ?? "").trim()
  const isFavourite = formData.get("isFavourite") === "true"

  if (!centerId) {
    return {
      isFavourite,
      error: "Không tìm thấy mã sân.",
    }
  }

  try {
    if (isFavourite) {
      await removeFavoriteSportCenter(centerId)

      return {
        isFavourite: false,
        message: "Đã xóa khỏi danh sách yêu thích.",
      }
    }

    await addFavoriteSportCenter(centerId)

    return {
      isFavourite: true,
      message: "Đã thêm vào danh sách yêu thích.",
    }
  } catch (error) {
    return {
      isFavourite,
      error:
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái yêu thích.",
    }
  }
}
