import {
  getPublicPlaySessionDetail,
  listPublicPlaySessionGuests,
  listPublicPlaySessionParticipants,
} from "@/features/play-sessions/api/public-play-sessions-service"
import type {
  GroupPlaySession,
  PlaySessionGuest,
  PlaySessionParticipant,
} from "@/features/play-sessions/types"
import { getSession } from "@/lib/session"

function normalizeUserId(userId?: string | null) {
  return typeof userId === "string"
    ? userId
        .trim()
        .toLowerCase()
        .replace(/[^a-f0-9]/g, "")
    : ""
}

function normalizeParticipantStatus(status?: string | null) {
  return String(status ?? "")
    .trim()
    .toUpperCase()
}

function isActiveParticipationStatus(status?: string | null) {
  return ["CONFIRMED", "PENDING", "WAITLIST", "REQUESTED"].includes(
    normalizeParticipantStatus(status)
  )
}

function toSlotCountValue(maxSlots: unknown): number | null {
  if (typeof maxSlots === "string") {
    const n = Number(maxSlots)
    return Number.isFinite(n) ? n : null
  }

  if (typeof maxSlots === "number") {
    return Number.isFinite(maxSlots) ? maxSlots : null
  }

  return null
}

export interface PlaySessionViewData {
  playSession: GroupPlaySession
  participants: PlaySessionParticipant[]
  guests: PlaySessionGuest[]
  participantsError: string | null
  guestsError: string | null
  currentUserId?: string | null
  isCreator: boolean
  hasJoined: boolean
  normalizedMaxSlots: number | null
}

export async function getPlaySessionViewData(
  sessionId: string
): Promise<PlaySessionViewData> {
  const userSession = await getSession()
  const currentUserId = userSession.user?.id

  let playSession: GroupPlaySession | null = null
  let participants: PlaySessionParticipant[] = []
  let guests: PlaySessionGuest[] = []
  let participantsError: string | null = null
  let guestsError: string | null = null

  const [sessionResult, participantsResult, guestsResult] =
    await Promise.allSettled([
      getPublicPlaySessionDetail(sessionId),
      listPublicPlaySessionParticipants(sessionId),
      listPublicPlaySessionGuests(sessionId, { status: "ALL" }),
    ])

  if (sessionResult.status === "rejected") {
    throw sessionResult.reason
  }

  playSession = sessionResult.value

  if (participantsResult.status === "fulfilled") {
    participants = participantsResult.value.data
  } else {
    participantsError = "Không thể tải danh sách người tham gia."
  }

  if (guestsResult.status === "fulfilled") {
    guests = guestsResult.value.data
  } else {
    guestsError = "Không thể tải danh sách guest."
  }

  const hasParticipationStatusFromSession =
    playSession.myParticipationStatus !== undefined &&
    playSession.myParticipationStatus !== null

  const hasJoinedFromSession = isActiveParticipationStatus(
    playSession.myParticipationStatus
  )

  const hasJoinedFromParticipants =
    !!normalizeUserId(currentUserId) &&
    participants.some(
      (participant) =>
        normalizeUserId(participant.userId) ===
          normalizeUserId(currentUserId) &&
        isActiveParticipationStatus(participant.status)
    )

  const hasJoined = hasParticipationStatusFromSession
    ? hasJoinedFromSession
    : hasJoinedFromParticipants

  const isCreator =
    !!normalizeUserId(currentUserId) &&
    normalizeUserId(currentUserId) === normalizeUserId(playSession.creatorId)

  return {
    playSession,
    participants,
    guests,
    participantsError,
    guestsError,
    currentUserId,
    isCreator,
    hasJoined,
    normalizedMaxSlots: toSlotCountValue(playSession.maxSlots),
  }
}
