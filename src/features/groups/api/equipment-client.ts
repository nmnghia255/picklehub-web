import type {
  CreateEquipmentInput,
  Equipment,
  EquipmentUsage,
  PaginatedResponse,
  UpdateEquipmentInput,
} from "../types"

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
    const message =
      (payload as { message?: string }).message || "Đã có lỗi xảy ra"
    throw new Error(message)
  }

  return response.json()
}

export const equipmentQueryKeys = {
  all: (groupId: string) => ["group-equipment", groupId] as const,
  list: (groupId: string, params?: QueryParams) =>
    ["group-equipment", groupId, "list", params] as const,
  detail: (groupId: string, equipmentId: string) =>
    ["group-equipment", groupId, equipmentId] as const,
  usages: (groupId: string, equipmentId: string, params?: QueryParams) =>
    ["group-equipment", groupId, equipmentId, "usages", params] as const,
}

export async function listEquipmentClient(
  groupId: string,
  params: {
    page?: number
    limit?: number
    condition?: string
    search?: string
    includeDeleted?: boolean
  } = {}
): Promise<PaginatedResponse<Equipment>> {
  const searchParams = toSearchParams(params as QueryParams)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<PaginatedResponse<Equipment>>(
    `/api/groups/${groupId}/equipment${suffix}`
  )
}

export async function getEquipmentClient(
  groupId: string,
  equipmentId: string
): Promise<{ message: string; data: Equipment }> {
  return fetchJson<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`
  )
}

export async function createEquipmentClient(
  groupId: string,
  data: CreateEquipmentInput
): Promise<{ message: string; data: Equipment }> {
  return fetchJson<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export async function updateEquipmentClient(
  groupId: string,
  equipmentId: string,
  data: UpdateEquipmentInput
): Promise<{ message: string; data: Equipment }> {
  return fetchJson<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  )
}

export async function deleteEquipmentClient(
  groupId: string,
  equipmentId: string
): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`,
    {
      method: "DELETE",
    }
  )
}

export async function logEquipmentUsageClient(
  groupId: string,
  equipmentId: string,
  data: { quantityUsed: number; note?: string; usedAt?: string }
): Promise<{ message: string; data: EquipmentUsage }> {
  return fetchJson<{ message: string; data: EquipmentUsage }>(
    `/api/groups/${groupId}/equipment/${equipmentId}/usages`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export async function listEquipmentUsagesClient(
  groupId: string,
  equipmentId: string,
  params: {
    page?: number
    limit?: number
    fromDate?: string
    toDate?: string
    sortOrder?: "asc" | "desc"
  } = {}
): Promise<PaginatedResponse<EquipmentUsage>> {
  const searchParams = toSearchParams(params as QueryParams)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchJson<PaginatedResponse<EquipmentUsage>>(
    `/api/groups/${groupId}/equipment/${equipmentId}/usages${suffix}`
  )
}
