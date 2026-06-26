import type { Guest, GuestListResponse } from "../types/guest-member"

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
  return json.data ?? []
}

export async function createGuestClient(
  groupId: string,
  data: {
    name: string
    email: string
    skillLevel: string
    phone?: string
    gender?: "MALE" | "FEMALE"
  }
): Promise<Guest> {
  const res = await fetch(`/api/groups/${groupId}/guests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể tạo khách vãng lai.")
  }
  const json = await res.json()
  return json.data ?? json
}

export async function approveGuestsClient(
  groupId: string,
  data: { guestIds: string[]; status: "ACTIVE" | "REJECTED" }
): Promise<{ id: string; status: string }[]> {
  const res = await fetch(`/api/groups/${groupId}/guests`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(
      payload.message || "Không thể cập nhật trạng thái khách vãng lai."
    )
  }
  const json = await res.json()
  return json.data ?? []
}

export async function deactivateGuestClient(
  groupId: string,
  guestId: string
): Promise<void> {
  const res = await fetch(`/api/groups/${groupId}/guests/${guestId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(
      payload.message || "Không thể hủy kích hoạt khách vãng lai."
    )
  }
}
