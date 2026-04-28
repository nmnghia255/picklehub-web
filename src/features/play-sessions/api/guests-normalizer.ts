import type { PlaySessionGuest } from "../types"

type AnyRecord = Record<string, unknown>

function asRecord(value: unknown): AnyRecord | null {
  if (!value || typeof value !== "object") {
    return null
  }

  return value as AnyRecord
}

function readString(source: AnyRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
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

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return undefined
}

export function normalizeGuest(raw: unknown): PlaySessionGuest | null {
  const source = asRecord(raw)
  if (!source) {
    return null
  }

  const id = readString(source, ["id", "guestId"]) ?? ""
  const playSessionId = readString(source, ["playSessionId", "sessionId"]) ?? ""
  const requestedByUserId =
    readString(source, ["requestedByUserId", "requestedBy", "userId"]) ?? ""
  const requestedByIsHost =
    readBoolean(source, ["requestedByIsHost", "isHostRequest", "isHost"]) ??
    false
  const name = readString(source, ["name", "guestName"]) ?? "Khach moi"

  const rawType =
    readString(source, ["type", "guestType", "kind"])?.toUpperCase() ??
    "DROP_IN"
  const type = rawType === "RESERVED" ? "RESERVED" : "DROP_IN"

  const rawStatus =
    readString(source, ["status", "guestStatus"])?.toUpperCase() ?? "REQUESTED"
  const status =
    rawStatus === "CONFIRMED" ||
    rawStatus === "WAITLISTED" ||
    rawStatus === "ON_HOLD"
      ? rawStatus
      : "REQUESTED"

  const skillLevel = readNumber(source, ["skillLevel", "level", "rating"])
  const createdAt = readString(source, ["createdAt"])
  const updatedAt = readString(source, ["updatedAt"])

  return {
    id,
    playSessionId,
    requestedByUserId,
    requestedByIsHost,
    name,
    skillLevel,
    type,
    status,
    createdAt,
    updatedAt,
  }
}

export function normalizeGuests(rawItems: unknown[]): PlaySessionGuest[] {
  return rawItems
    .map((item) => normalizeGuest(item))
    .filter((item): item is PlaySessionGuest => item !== null)
}
