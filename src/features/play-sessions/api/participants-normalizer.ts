import type {
  PlaySessionParticipant,
  PublicPlaySessionParticipant,
} from "../types"

type AnyRecord = Record<string, unknown>

function asRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object") {
    return null
  }

  return value as AnyRecord
}

function readStringValue(
  source: AnyRecord,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

function readStringByPaths(
  source: AnyRecord,
  paths: string[]
): string | undefined {
  for (const path of paths) {
    const segments = path.split(".").filter(Boolean)
    if (segments.length === 0) {
      continue
    }

    let cursor: unknown = source
    for (const segment of segments) {
      if (!cursor || typeof cursor !== "object") {
        cursor = undefined
        break
      }

      cursor = (cursor as AnyRecord)[segment]
    }

    if (typeof cursor === "string" && cursor.trim().length > 0) {
      return cursor.trim()
    }
  }

  return undefined
}

function readNestedStringValue(
  source: AnyRecord,
  parentKeys: string[],
  childKeys: string[]
): string | undefined {
  for (const parentKey of parentKeys) {
    const nested = asRecord(source[parentKey])
    if (!nested) {
      continue
    }

    const nestedValue = readStringValue(nested, childKeys)
    if (nestedValue) {
      return nestedValue
    }
  }

  return undefined
}

function readName(source: AnyRecord): string {
  const firstName =
    readStringValue(source, ["firstName", "givenName", "first_name"]) ??
    readNestedStringValue(
      source,
      ["user", "profile"],
      ["firstName", "givenName", "first_name"]
    ) ??
    readStringByPaths(source, [
      "user.profile.firstName",
      "user.profile.first_name",
      "participant.profile.firstName",
      "participant.profile.first_name",
      "account.profile.firstName",
      "account.profile.first_name",
    ])

  const lastName =
    readStringValue(source, ["lastName", "familyName", "last_name"]) ??
    readNestedStringValue(
      source,
      ["user", "profile"],
      ["lastName", "familyName", "last_name"]
    ) ??
    readStringByPaths(source, [
      "user.profile.lastName",
      "user.profile.last_name",
      "participant.profile.lastName",
      "participant.profile.last_name",
      "account.profile.lastName",
      "account.profile.last_name",
    ])

  const fullName =
    readStringValue(source, [
      "name",
      "fullName",
      "full_name",
      "displayName",
      "display_name",
      "userName",
      "username",
    ]) ??
    readNestedStringValue(
      source,
      ["user", "profile", "participant"],
      [
        "name",
        "fullName",
        "full_name",
        "displayName",
        "display_name",
        "userName",
        "username",
      ]
    ) ??
    readStringByPaths(source, [
      "user.profile.name",
      "user.profile.fullName",
      "user.profile.full_name",
      "user.profile.displayName",
      "user.profile.display_name",
      "participant.user.name",
      "participant.user.fullName",
      "participant.user.full_name",
      "participant.profile.name",
      "participant.profile.fullName",
      "participant.profile.full_name",
      "member.name",
      "member.fullName",
      "member.full_name",
    ])

  if (fullName) {
    return fullName
  }

  const composedName = [firstName, lastName].filter(Boolean).join(" ").trim()
  if (composedName) {
    return composedName
  }

  return "Người chơi"
}

function readBoolean(source: AnyRecord, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "boolean") {
      return value
    }
  }

  return undefined
}

function readNumber(source: AnyRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }

    if (typeof value === "string") {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}

export function normalizeParticipant(
  raw: unknown
): PlaySessionParticipant | PublicPlaySessionParticipant | null {
  const source = asRecord(raw)
  if (!source) {
    return null
  }

  const id =
    readStringValue(source, ["id", "participantId"]) ??
    readNestedStringValue(source, ["participant"], ["id"]) ??
    ""

  const userId =
    readStringValue(source, ["userId", "participantUserId"]) ??
    readNestedStringValue(source, ["user", "participant"], ["id", "userId"]) ??
    id

  const rawStatus =
    readStringValue(source, ["status", "participantStatus"])?.toUpperCase() ??
    "CONFIRMED"

  const status = rawStatus === "JOINED" ? "CONFIRMED" : rawStatus

  const guestsCount = readNumber(source, [
    "guestsCount",
    "guestCount",
    "guests",
  ])

  const paymentStatus = readStringValue(source, [
    "paymentStatus",
    "payment_state",
  ])

  const isCheckedIn = readBoolean(source, ["isCheckedIn", "checkedIn"])

  const joinedAt =
    readStringValue(source, ["joinedAt", "createdAt", "joined_at"]) ?? ""

  const playSessionId =
    readStringValue(source, ["playSessionId", "sessionId"]) ??
    readNestedStringValue(source, ["playSession", "session"], ["id"]) ??
    ""

  const avatarUrl =
    readStringValue(source, ["avatarUrl", "avatar", "imageUrl"]) ??
    readNestedStringValue(
      source,
      ["user", "profile", "participant"],
      ["avatarUrl", "avatar", "imageUrl"]
    ) ??
    readStringByPaths(source, [
      "user.profile.avatarUrl",
      "user.profile.avatar",
      "user.profile.imageUrl",
      "participant.user.avatarUrl",
      "participant.user.avatar",
      "participant.user.imageUrl",
    ])

  return {
    id,
    playSessionId,
    userId,
    status,
    guestsCount,
    paymentStatus,
    isCheckedIn,
    joinedAt,
    name: readName(source),
    avatarUrl,
  }
}

export function normalizeParticipants<T extends PlaySessionParticipant>(
  rawItems: unknown[]
): T[] {
  return rawItems
    .map((item) => normalizeParticipant(item))
    .filter((item): item is T => item !== null)
}
