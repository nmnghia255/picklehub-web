"use server"

import axios from "axios"
import { z } from "zod"

import {
  getMyProfile,
  updateMyProfile,
  type UpdateMyProfilePayload,
} from "@/features/profile/api/profile-service"
import type { User } from "@/features/profile/types"

export interface UpdateProfileState {
  error?: string
  success?: boolean
  message?: string
  user?: User
}

const updateAvatarSchema = z.object({
  avatarUrl: z.preprocess((value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }, z.string().max(2048).nullable()),
})

export async function updateAvatarAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const avatarFileField = formData.get("avatarFile")
  const avatarFile =
    avatarFileField instanceof File && avatarFileField.size > 0
      ? avatarFileField
      : null

  if (avatarFile) {
    return {
      error:
        "User service hiện chỉ hỗ trợ cập nhật avatar bằng avatarUrl. Vui lòng dùng Avatar URL.",
    }
  }

  const parsed = updateAvatarSchema.safeParse({
    avatarUrl: formData.get("avatarUrl"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const currentProfile = await getMyProfile()
    const payload: UpdateMyProfilePayload = {
      fullName: currentProfile.fullName,
      avatarUrl: parsed.data.avatarUrl,
      bio: currentProfile.bio ?? null,
      gender: currentProfile.gender ?? null,
      selfRating: currentProfile.selfRating,
      preferredHand: currentProfile.preferredHand ?? null,
    }

    const updatedUser = await updateMyProfile(payload)

    return {
      success: true,
      message: "Cập nhật ảnh đại diện thành công.",
      user: updatedUser,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.",
      }
    }

    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." }
  }
}

const updateProfileInformationSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên hiển thị"),
  bio: z.preprocess((value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }, z.string().max(255).nullable()),
  gender: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    },
    z.enum(["MALE", "FEMALE", "OTHER"]).nullable()
  ),
  selfRating: z.preprocess((value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    if (trimmed.length === 0) return undefined
    if (trimmed === "5.0+") return 5

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : value
  }, z.number().min(2).max(5).optional()),
  preferredHand: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    },
    z.enum(["RIGHT", "LEFT", "AMBIDEXTROUS"]).nullable()
  ),
})

export async function updateProfileInformationAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const parsed = updateProfileInformationSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    gender: formData.get("gender"),
    selfRating: formData.get("selfRating"),
    preferredHand: formData.get("preferredHand"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    const currentProfile = await getMyProfile()
    const payload: UpdateMyProfilePayload = {
      fullName: parsed.data.name,
      avatarUrl: currentProfile.avatarUrl ?? null,
      bio: parsed.data.bio,
      gender: parsed.data.gender,
      ...(typeof parsed.data.selfRating === "number"
        ? { selfRating: parsed.data.selfRating }
        : {}),
      preferredHand: parsed.data.preferredHand,
    }

    const updatedUser = await updateMyProfile(payload)

    return {
      success: true,
      message: "edit.updateSuccess",
      user: updatedUser,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.message || "edit.updateError",
      }
    }

    return { error: "edit.genericError" }
  }
}
