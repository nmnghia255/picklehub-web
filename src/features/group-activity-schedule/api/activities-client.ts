import type {
  ActivityAttendance,
  CreateGroupActivityDto,
  GroupActivity,
  ListActivitiesParams,
  PaginatedActivitiesResponse,
  UpdateGroupActivityDto,
} from "../group-activity-schedule.types"

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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = "Đã có lỗi xảy ra"
    try {
      const payload = await response.json()
      if (Array.isArray(payload.message)) {
        message = payload.message.join(", ")
      } else {
        message = payload.message || payload.error || message
      }
    } catch {
      try {
        const text = await response.text()
        if (text && text.length < 200) {
          message = text
        }
      } catch {}
    }
    throw new Error(message)
  }

  return response.json()
}

export const activityQueryKeys = {
  all: (groupId: string) => ["group-activities", groupId] as const,
  list: (groupId: string, params: ListActivitiesParams) =>
    ["group-activities", groupId, "list", params] as const,
  detail: (groupId: string, activityId: string) =>
    ["group-activities", groupId, "detail", activityId] as const,
}

export async function createActivityClient(
  groupId: string,
  data: CreateGroupActivityDto
): Promise<GroupActivity> {
  return fetchJson<GroupActivity>(`/api/groups/${groupId}/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listActivitiesClient(
  groupId: string,
  params: ListActivitiesParams = {}
): Promise<PaginatedActivitiesResponse> {
  const searchParams = toSearchParams(params as QueryParams)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<PaginatedActivitiesResponse>(
    `/api/groups/${groupId}/activities${suffix}`
  )
}

export async function getActivityClient(
  groupId: string,
  activityId: string
): Promise<GroupActivity> {
  return fetchJson<GroupActivity>(
    `/api/groups/${groupId}/activities/${activityId}`
  )
}

export async function updateActivityClient(
  groupId: string,
  activityId: string,
  data: UpdateGroupActivityDto
): Promise<GroupActivity> {
  return fetchJson<GroupActivity>(
    `/api/groups/${groupId}/activities/${activityId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  )
}

export async function deleteActivityClient(
  groupId: string,
  activityId: string
): Promise<void> {
  await fetchJson<void>(`/api/groups/${groupId}/activities/${activityId}`, {
    method: "DELETE",
  })
}

export async function reportAbsenceClient(
  groupId: string,
  activityId: string
): Promise<ActivityAttendance> {
  return fetchJson<ActivityAttendance>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/absence`,
    {
      method: "POST",
    }
  )
}

export async function cancelAbsenceClient(
  groupId: string,
  activityId: string
): Promise<ActivityAttendance> {
  return fetchJson<ActivityAttendance>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/absence`,
    {
      method: "DELETE",
    }
  )
}

export async function registerActivityGuestsClient(
  groupId: string,
  activityId: string,
  guestCount: number
): Promise<ActivityAttendance> {
  return fetchJson<ActivityAttendance>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/guests`,
    {
      method: "POST",
      body: JSON.stringify({ guestCount }),
    }
  )
}

export async function approveActivityGuestsClient(
  groupId: string,
  activityId: string,
  memberId: string,
  status: "APPROVED" | "REJECTED"
): Promise<unknown> {
  return fetchJson<unknown>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/${memberId}/guests/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}

export async function deleteActivityGuestsClient(
  groupId: string,
  activityId: string,
  memberId: string
): Promise<unknown> {
  return fetchJson<unknown>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/${memberId}/guests`,
    {
      method: "DELETE",
    }
  )
}

export async function getGuestRequestsClient(
  groupId: string,
  activityId: string,
  status?: "PENDING" | "APPROVED" | "REJECTED"
): Promise<{
  message: string
  data: Array<{
    memberId: string
    userId: string
    role: string
    guestCount: number
    guestStatus: "PENDING" | "APPROVED" | "REJECTED" | null
    pendingGuestCount: number | null
    reportedAt: string
  }>
}> {
  const query = status ? `?status=${status}` : ""
  return fetchJson<{
    message: string
    data: Array<{
      memberId: string
      userId: string
      role: string
      guestCount: number
      guestStatus: "PENDING" | "APPROVED" | "REJECTED" | null
      pendingGuestCount: number | null
      reportedAt: string
    }>
  }>(
    `/api/groups/${groupId}/activities/${activityId}/attendance/guests${query}`
  )
}
