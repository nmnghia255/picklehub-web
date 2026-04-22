import {
  CalendarDays,
  Clock3,
  CreditCard,
  Handshake,
  MapPin,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupPlaySession } from "@/features/play-sessions/types"
import {
  formatDateTime,
  getDateOnly,
  normalizeStatus,
} from "@/utils/time-helper"

interface PlaySessionInfoProps {
  session: GroupPlaySession
  participantCount: number
}

interface HostInfo {
  name: string
  avatarUrl?: string
  fallback: string
}

type SessionRecord = GroupPlaySession & Record<string, unknown>

function readStringValue(
  source: Record<string, unknown>,
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

function readNestedStringValue(
  source: Record<string, unknown>,
  parentKeys: string[],
  childKeys: string[]
): string | undefined {
  for (const parentKey of parentKeys) {
    const candidate = source[parentKey]
    if (!candidate || typeof candidate !== "object") {
      continue
    }

    const nestedValue = readStringValue(
      candidate as Record<string, unknown>,
      childKeys
    )

    if (nestedValue) {
      return nestedValue
    }
  }

  return undefined
}

function getHostMeta(session: GroupPlaySession) {
  const sessionRecord = session as SessionRecord

  const name =
    readStringValue(sessionRecord, [
      "hostName",
      "creatorName",
      "organizerName",
      "createdByName",
    ]) ??
    readNestedStringValue(
      sessionRecord,
      ["host", "creator", "user"],
      ["name", "fullName", "displayName"]
    ) ??
    `tên host`

  const avatarUrl =
    readStringValue(sessionRecord, [
      "hostAvatarUrl",
      "creatorAvatarUrl",
      "organizerAvatarUrl",
    ]) ??
    readNestedStringValue(
      sessionRecord,
      ["host", "creator", "user"],
      ["avatarUrl", "avatar", "imageUrl"]
    )

  const fallback = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 1)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return {
    name,
    avatarUrl,
    fallback: fallback || "H",
  }
}

function getHosts(session: GroupPlaySession): HostInfo[] {
  const sessionRecord = session as SessionRecord
  const primaryHost = getHostMeta(session)
  const hosts: HostInfo[] = [primaryHost]

  const hostArrays = ["hosts", "hostUsers", "organizers", "coHosts"]
  for (const key of hostArrays) {
    const candidates = sessionRecord[key]
    if (!Array.isArray(candidates)) {
      continue
    }

    for (const item of candidates) {
      if (!item || typeof item !== "object") {
        continue
      }

      const hostRecord = item as Record<string, unknown>
      const name = readStringValue(hostRecord, [
        "name",
        "fullName",
        "displayName",
      ])
      if (!name) {
        continue
      }

      const avatarUrl = readStringValue(hostRecord, [
        "avatarUrl",
        "avatar",
        "imageUrl",
      ])

      const fallback = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")

      hosts.push({
        name,
        avatarUrl,
        fallback: fallback || "H",
      })
    }
  }

  const additionalName = readStringValue(sessionRecord, [
    "coHostName",
    "secondHostName",
  ])
  if (additionalName) {
    const additionalAvatar = readStringValue(sessionRecord, [
      "coHostAvatarUrl",
      "secondHostAvatarUrl",
    ])
    const fallback = additionalName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")

    hosts.push({
      name: additionalName,
      avatarUrl: additionalAvatar,
      fallback: fallback || "H",
    })
  }

  const uniqueHosts = hosts.filter((host, index, arr) => {
    return (
      arr.findIndex((candidate) => {
        return (
          candidate.name.toLowerCase() === host.name.toLowerCase() &&
          (candidate.avatarUrl || "") === (host.avatarUrl || "")
        )
      }) === index
    )
  })

  return uniqueHosts.slice(0, 2)
}

function getSessionFormatLabel(session: GroupPlaySession) {
  const sessionRecord = session as SessionRecord
  const rawFormat =
    readStringValue(sessionRecord, ["format", "sessionFormat", "playFormat"]) ??
    "social"

  const normalized = rawFormat.toLowerCase()
  if (normalized.includes("social")) {
    return "Social"
  }

  return rawFormat
}

function getSessionFeeLabel(session: GroupPlaySession) {
  const sessionRecord = session as SessionRecord
  const rawFeeType =
    readStringValue(sessionRecord, [
      "feeType",
      "costType",
      "paymentType",
      "splitType",
    ])?.toUpperCase() ?? ""

  const formattedFee = `${Math.max(session.fee ?? 0, 0).toLocaleString("vi-VN")}đ`

  if (rawFeeType === "FREE" || rawFeeType === "MIEN_PHI" || session.fee <= 0) {
    return "Miễn phí"
  }

  if (
    rawFeeType === "SPLIT_EQUALLY" ||
    rawFeeType === "SPLIT" ||
    rawFeeType === "CHIA_DEU"
  ) {
    return `Chia đều (tổng ${formattedFee})`
  }

  if (rawFeeType === "PER_PERSON" || rawFeeType === "MOI_NGUOI") {
    return `${formattedFee}/người`
  }

  return `${formattedFee}/người`
}

export function PlaySessionInfo({
  session,
  participantCount,
}: PlaySessionInfoProps) {
  const hosts = getHosts(session)
  const locationLabel =
    session.location || session.locationNote || "Chưa có địa chỉ"
  const sessionFormatLabel = getSessionFormatLabel(session)
  const sessionFeeLabel = getSessionFeeLabel(session)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Thông tin</span>
          <Badge variant="outline">{normalizeStatus(session.status)}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Hosts</p>
          <div className="flex flex-wrap gap-6">
            {hosts.map((host) => (
              <div
                key={`${host.name}-${host.avatarUrl ?? "no-avatar"}`}
                className="flex flex-col items-center gap-2"
              >
                <Avatar className="size-10 border">
                  <AvatarImage src={host.avatarUrl} alt={host.name} />
                  <AvatarFallback>{host.fallback}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground">{host.name}</span>
              </div>
            ))}
          </div>
        </div>

        {session.description && (
          <p className="text-sm text-muted-foreground">{session.description}</p>
        )}

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <span>Ngày: {getDateOnly(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-4" />
            <span>
              Thời gian: {formatDateTime(session.startTime)} -{" "}
              {formatDateTime(session.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4" />
            <span>
              Số người tham gia: {session.joinedCount ?? participantCount}
              {session.maxSlots ? ` / ${session.maxSlots}` : ""}
            </span>
          </div>

          <div className="flex items-start gap-1.5 sm:col-span-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{locationLabel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Handshake className="size-4" />
            <span>{sessionFormatLabel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <CreditCard className="size-4" />
            <span>Phí: {sessionFeeLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
