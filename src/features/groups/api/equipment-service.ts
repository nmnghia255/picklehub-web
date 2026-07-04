import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateEquipmentInput,
  Equipment,
  EquipmentFavorite,
  EquipmentUsage,
  PaginatedResponse,
  UpdateEquipmentFavoriteInput,
  UpdateEquipmentInput,
} from "../types"

export async function listEquipment(
  groupId: string,
  params: {
    page?: number
    limit?: number
    condition?: string
    search?: string
    includeDeleted?: boolean
  } = {}
): Promise<PaginatedResponse<Equipment>> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<PaginatedResponse<Equipment>>(
    `/api/groups/${groupId}/equipment`,
    { params }
  )
  return response.data
}

export async function getEquipment(
  groupId: string,
  equipmentId: string
): Promise<{ message: string; data: Equipment }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`
  )
  return response.data
}

export async function createEquipment(
  groupId: string,
  data: CreateEquipmentInput
): Promise<{ message: string; data: Equipment }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment`,
    data
  )
  return response.data
}

export async function updateEquipment(
  groupId: string,
  equipmentId: string,
  data: UpdateEquipmentInput
): Promise<{ message: string; data: Equipment }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`,
    data
  )
  return response.data
}

export async function deleteEquipment(
  groupId: string,
  equipmentId: string
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<{ message: string }>(
    `/api/groups/${groupId}/equipment/${equipmentId}`
  )
  return response.data
}

export async function logEquipmentUsage(
  groupId: string,
  equipmentId: string,
  data: { quantityUsed: number; note?: string; usedAt?: string }
): Promise<{ message: string; data: EquipmentUsage }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string; data: EquipmentUsage }>(
    `/api/groups/${groupId}/equipment/${equipmentId}/usages`,
    data
  )
  return response.data
}

export async function listEquipmentUsages(
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
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<PaginatedResponse<EquipmentUsage>>(
    `/api/groups/${groupId}/equipment/${equipmentId}/usages`,
    { params }
  )
  return response.data
}

export async function listEquipmentFavorites(
  groupId: string
): Promise<{ data: EquipmentFavorite[] }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<{ data: EquipmentFavorite[] }>(
    `/api/groups/${groupId}/equipment-favorites`
  )
  return response.data
}

export async function updateEquipmentFavorite(
  groupId: string,
  id: string,
  data: UpdateEquipmentFavoriteInput
): Promise<{ message: string; data: EquipmentFavorite }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.put<{
    message: string
    data: EquipmentFavorite
  }>(`/api/groups/${groupId}/equipment-favorites/${id}`, data)
  return response.data
}

export async function deleteEquipmentFavorite(
  groupId: string,
  id: string
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<{ message: string }>(
    `/api/groups/${groupId}/equipment-favorites/${id}`
  )
  return response.data
}

export async function toggleEquipmentFavorite(
  groupId: string,
  equipmentId: string,
  isFavorite: boolean
): Promise<{ message: string; data: Equipment }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<{ message: string; data: Equipment }>(
    `/api/groups/${groupId}/equipment/${equipmentId}/favorite`,
    { isFavorite }
  )
  return response.data
}
