"use server"

import { z } from "zod"

import {
  approveGroupPlaySessionGuest,
  listGroupPlaySessionGuests,
  requestGroupPlaySessionGuest,
  reserveGroupPlaySessionGuest,
} from "@/features/play-sessions/api/group-play-sessions-service"
import {
  approvePublicPlaySessionGuest,
  listPublicPlaySessionGuests,
  requestPublicPlaySessionGuest,
  reservePublicPlaySessionGuest,
} from "@/features/play-sessions/api/public-play-sessions-service"
import type { PlaySessionGuest } from "@/features/play-sessions/types"

const guestTypeSchema = z.enum(["DROP_IN", "RESERVED"]).default("DROP_IN")

const requestGuestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên guest là bắt buộc.")
    .max(120, "Tên guest tối đa 120 ký tự."),
  type: guestTypeSchema,
  skillLevel: z
    .union([
      z.number().min(0, "Skill level phải từ 0 đến 10.").max(10),
      z.undefined(),
    ])
    .optional(),
})

const approveGuestSchema = z.object({
  status: z.enum(["CONFIRMED", "WAITLISTED", "ON_HOLD"]),
})

export type PlaySessionGuestActionState = {
  success?: boolean
  error?: string
  message?: string
}

function parseApiError(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message
  ) {
    const apiMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message

    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

function parseSkillLevel(value: FormDataEntryValue | null): number | undefined {
  if (value === null || String(value).trim().length === 0) {
    return undefined
  }

  const raw = Number(value)
  if (!Number.isFinite(raw)) {
    return Number.NaN
  }

  const rounded = Math.round(raw * 100) / 100
  return rounded
}

async function requestGuestByContext(
  groupId: string | null,
  playSessionId: string,
  payload: {
    name: string
    type: "DROP_IN" | "RESERVED"
    skillLevel?: number
  }
): Promise<PlaySessionGuest> {
  if (groupId) {
    return requestGroupPlaySessionGuest(groupId, playSessionId, payload)
  }

  return requestPublicPlaySessionGuest(playSessionId, payload)
}

async function reserveGuestByContext(
  groupId: string | null,
  playSessionId: string,
  payload: {
    name: string
    type: "DROP_IN" | "RESERVED"
    skillLevel?: number
  }
): Promise<PlaySessionGuest> {
  if (groupId) {
    return reserveGroupPlaySessionGuest(groupId, playSessionId, payload)
  }

  return reservePublicPlaySessionGuest(playSessionId, payload)
}

async function approveGuestByContext(
  groupId: string | null,
  playSessionId: string,
  guestId: string,
  payload: {
    status: "CONFIRMED" | "WAITLISTED" | "ON_HOLD"
  }
): Promise<PlaySessionGuest> {
  if (groupId) {
    return approveGroupPlaySessionGuest(
      groupId,
      playSessionId,
      guestId,
      payload
    )
  }

  return approvePublicPlaySessionGuest(playSessionId, guestId, payload)
}

export async function requestPlaySessionGuestAction(
  groupId: string | null,
  playSessionId: string,
  _state: PlaySessionGuestActionState,
  formData: FormData
): Promise<PlaySessionGuestActionState> {
  try {
    const skillLevel = parseSkillLevel(formData.get("skillLevel"))
    const parsed = requestGuestSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "DROP_IN").toUpperCase(),
      skillLevel,
    })

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu guest không hợp lệ.",
      }
    }

    await requestGuestByContext(groupId, playSessionId, parsed.data)

    return {
      success: true,
      message: "Đã gửi yêu cầu guest.",
    }
  } catch (error) {
    return {
      success: false,
      error: parseApiError(error, "Không thể gửi yêu cầu guest."),
    }
  }
}

export async function reservePlaySessionGuestAction(
  groupId: string | null,
  playSessionId: string,
  _state: PlaySessionGuestActionState,
  formData: FormData
): Promise<PlaySessionGuestActionState> {
  try {
    const skillLevel = parseSkillLevel(formData.get("skillLevel"))
    const parsed = requestGuestSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "DROP_IN").toUpperCase(),
      skillLevel,
    })

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu guest không hợp lệ.",
      }
    }

    await reserveGuestByContext(groupId, playSessionId, parsed.data)

    return {
      success: true,
      message: "Đã reserve guest vào confirmed.",
    }
  } catch (error) {
    return {
      success: false,
      error: parseApiError(error, "Không thể reserve guest."),
    }
  }
}

export async function approvePlaySessionGuestAction(
  groupId: string | null,
  playSessionId: string,
  guestId: string,
  _state: PlaySessionGuestActionState,
  formData: FormData
): Promise<PlaySessionGuestActionState> {
  try {
    const parsed = approveGuestSchema.safeParse({
      status: String(formData.get("status") ?? "").toUpperCase(),
    })

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Trạng thái không hợp lệ.",
      }
    }

    await approveGuestByContext(groupId, playSessionId, guestId, parsed.data)

    return {
      success: true,
      message: "Đã cập nhật trạng thái guest.",
    }
  } catch (error) {
    return {
      success: false,
      error: parseApiError(error, "Không thể duyệt guest."),
    }
  }
}

export async function listPlaySessionGuestsAction(
  groupId: string | null,
  playSessionId: string,
  status: "ALL" | "REQUESTED" | "CONFIRMED" | "WAITLISTED" | "ON_HOLD" = "ALL"
) {
  if (groupId) {
    return listGroupPlaySessionGuests(groupId, playSessionId, { status })
  }

  return listPublicPlaySessionGuests(playSessionId, { status })
}
