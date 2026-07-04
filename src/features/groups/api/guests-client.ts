import type {
  CreateGuestInput,
  Guest,
  GuestListResponse,
} from "../types/guest-member"

type QueryParams = Record<string, string | number | boolean | null | undefined>

function toSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()
  if (!params) return searchParams
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }
  return searchParams
}

export const guestQueryKeys = {
  all: (groupId: string) => ["group-guests", groupId] as const,
  list: (groupId: string, params?: QueryParams) =>
    [...guestQueryKeys.all(groupId), "list", params] as const,
}

export async function listGuestsClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    status?: string
    invitedById?: string
  } = {}
): Promise<Guest[]> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const res = await fetch(`/api/groups/${groupId}/guests${suffix}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(
      payload.message || "Không thể tải danh sách khách vãng lai."
    )
  }
  const json: GuestListResponse = await res.json()
  const list = json.data ?? []

  return list.map((item) => {
    // Map new/old status fields
    let mappedStatus = item.status
    if (mappedStatus === "PENDING_APPROVAL") mappedStatus = "PENDING"
    if (mappedStatus === "ACTIVE") mappedStatus = "APPROVED"
    if (mappedStatus === "INACTIVE") mappedStatus = "EXPIRED"

    const guestsCount = item.guestsCount ?? item.guestCount ?? 0
    const sessionsCount = item.sessionsCount ?? item.sessionCount ?? 0
    const remainingSessions = item.remainingSessions ?? 0
    const memberId = item.memberId ?? item.invitedById
    const member = item.member ?? item.invitedBy

    return {
      ...item,
      // Backend properties
      guestsCount,
      sessionsCount,
      remainingSessions,
      memberId,
      member,
      status: mappedStatus,

      // Legacy fallback properties
      guestCount: guestsCount,
      sessionCount: sessionsCount,
      invitedById: memberId,
      invitedBy: member,
    } as Guest
  })
}

export async function createGuestClient(
  groupId: string,
  data: CreateGuestInput
): Promise<Guest> {
  const payload = {
    guestsCount: data.guestsCount ?? data.guestCount,
    sessionsCount: data.sessionsCount ?? data.sessionCount,
  }

  const res = await fetch(`/api/groups/${groupId}/guests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    console.error("createGuestClient Error Details:", payload)
    const detailMsg = payload.details
      ? typeof payload.details === "object"
        ? JSON.stringify(payload.details)
        : String(payload.details)
      : ""
    throw new Error(
      (payload.message || "Không thể tạo khách vãng lai.") +
        (detailMsg ? ` (${detailMsg})` : "")
    )
  }
  const json = await res.json()
  const item = json.data ?? json

  // Map returned items for compatibility
  let mappedStatus = item.status
  if (mappedStatus === "PENDING_APPROVAL") mappedStatus = "PENDING"
  if (mappedStatus === "ACTIVE") mappedStatus = "APPROVED"
  if (mappedStatus === "INACTIVE") mappedStatus = "EXPIRED"

  const guestsCount = item.guestsCount ?? item.guestCount ?? 0
  const sessionsCount = item.sessionsCount ?? item.sessionCount ?? 0
  const memberId = item.memberId ?? item.invitedById
  const member = item.member ?? item.invitedBy

  return {
    ...item,
    guestsCount,
    sessionsCount,
    remainingSessions: item.remainingSessions ?? 0,
    memberId,
    member,
    status: mappedStatus,
    guestCount: guestsCount,
    sessionCount: sessionsCount,
    invitedById: memberId,
    invitedBy: member,
  } as Guest
}

export async function approveGuestsClient(
  groupId: string,
  data: { guestIds: string[]; status: "APPROVED" | "REJECTED" | "ACTIVE" }
): Promise<{ id: string; status: string }[]> {
  const mappedStatus = data.status === "ACTIVE" ? "APPROVED" : data.status

  const results = await Promise.all(
    data.guestIds.map(async (guestId) => {
      const res = await fetch(
        `/api/groups/${groupId}/guests/${guestId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: mappedStatus }),
        }
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(
          payload.message || `Không thể cập nhật trạng thái khách ${guestId}.`
        )
      }
      return { id: guestId, status: mappedStatus }
    })
  )
  return results
}

export async function ownerCancelGuestClient(
  groupId: string,
  guestId: string
): Promise<void> {
  const res = await fetch(`/api/groups/${groupId}/guests/${guestId}/cancel`, {
    method: "PATCH",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    console.error("ownerCancelGuestClient Error Details:", payload)
    const detailMsg = payload.details
      ? typeof payload.details === "object"
        ? JSON.stringify(payload.details)
        : String(payload.details)
      : ""
    throw new Error(
      (payload.message || "Không thể hủy yêu cầu khách vãng lai.") +
        (detailMsg ? ` (${detailMsg})` : "")
    )
  }
}

export async function deleteGuestClient(
  groupId: string,
  guestId: string
): Promise<void> {
  const res = await fetch(`/api/groups/${groupId}/guests/${guestId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể xóa khách vãng lai.")
  }
}
