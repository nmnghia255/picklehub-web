"use server"
// Have not had api yet

import axios from "axios"
import { z } from "zod"

import { getAuthenticatedAxios } from "@/lib/server-api"

export interface UpdateProfileState {
  error?: string
  success?: boolean
  message?: string
}

const updateProfileSchema = z.object({
  height: z.coerce
    .number()
    .min(80, "Chiều cao không hợp lệ")
    .max(250, "Chiều cao không hợp lệ"),
  weight: z.coerce
    .number()
    .min(20, "Cân nặng không hợp lệ")
    .max(300, "Cân nặng không hợp lệ"),
  level: z.string().min(1, "Vui lòng chọn trình độ"),
  playStyle: z.string().min(1, "Vui lòng chọn lối chơi"),
  timeToPlay: z.string().min(1, "Vui lòng chọn thời gian chơi"),
})

export async function updateProfileDetailsAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const parsed = updateProfileSchema.safeParse({
    height: formData.get("height"),
    weight: formData.get("weight"),
    level: formData.get("level"),
    playStyle: formData.get("playStyle"),
    timeToPlay: formData.get("timeToPlay"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const client = await getAuthenticatedAxios()
    await client.patch("/api/auth/me", {
      height: parsed.data.height,
      weight: parsed.data.weight,
      level: parsed.data.level,
      playStyle: parsed.data.playStyle,
      timeToPlay: parsed.data.timeToPlay,
    })
    return { success: true, message: "Cập nhật hồ sơ thành công." }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      }
    }

    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}
