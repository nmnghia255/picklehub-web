import type {
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
    const payload = await response.json().catch(() => ({}))
    const message = payload.message || "Đã có lỗi xảy ra"
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
