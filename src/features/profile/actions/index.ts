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
  name: z.string().trim().min(1, "Vui lòng nhập tên hiển thị"),
  avatarUrl: z.preprocess((value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }, z.string().max(500).nullable()),
  bio: z.preprocess((value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }, z.string().max(500).nullable()),
  gender: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    },
    z.enum(["MALE", "FEMALE", "OTHER"]).nullable()
  ),
  selfRating: z.coerce
    .number()
    .min(0, "Tự đánh giá không hợp lệ")
    .max(10, "Tự đánh giá không hợp lệ"),
  preferredHand: z.enum(["RIGHT", "LEFT", "AMBIDEXTROUS"]),
})

export async function updateProfileDetailsAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const avatarFileField = formData.get("avatarFile")
  const avatarFile =
    avatarFileField instanceof File && avatarFileField.size > 0
      ? avatarFileField
      : null

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    bio: formData.get("bio"),
    gender: formData.get("gender"),
    selfRating: formData.get("selfRating"),
    preferredHand: formData.get("preferredHand"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const client = await getAuthenticatedAxios()

    if (avatarFile) {
      const multipart = new FormData()
      multipart.append("name", parsed.data.name)
      multipart.append("avatar", avatarFile, avatarFile.name)
      multipart.append("avatarFile", avatarFile, avatarFile.name)

      if (parsed.data.avatarUrl !== null) {
        multipart.append("avatarUrl", parsed.data.avatarUrl)
      }
      if (parsed.data.bio !== null) {
        multipart.append("bio", parsed.data.bio)
      }
      if (parsed.data.gender !== null) {
        multipart.append("gender", parsed.data.gender)
      }

      multipart.append("selfRating", parsed.data.selfRating.toString())
      multipart.append("preferredHand", parsed.data.preferredHand)

      await client.patch("/api/users/me", multipart, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } else {
      await client.patch("/api/users/me", {
        name: parsed.data.name,
        avatarUrl: parsed.data.avatarUrl,
        bio: parsed.data.bio,
        gender: parsed.data.gender,
        selfRating: parsed.data.selfRating,
        preferredHand: parsed.data.preferredHand,
      })
    }

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
