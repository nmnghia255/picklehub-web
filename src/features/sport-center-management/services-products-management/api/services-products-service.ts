"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateProductPayload,
  CreateServicePayload,
  MediaUploadResult,
  SportCenterProduct,
  SportCenterService,
  UpdateProductPayload,
  UpdateServicePayload,
} from "../types"

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: T[] }).data)
  ) {
    return (payload as { data: T[] }).data
  }
  return []
}

function unwrapObject<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data
  ) {
    return (payload as { data: T }).data
  }
  return payload as T
}

// ============================================================================
// Services
// ============================================================================

export async function listCenterServices(
  centerId: string
): Promise<SportCenterService[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get(`/api/sport-centers/${centerId}/services`)
  return unwrapArray<SportCenterService>(response.data)
}

export async function createCenterService(
  centerId: string,
  payload: CreateServicePayload
): Promise<SportCenterService> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post(
    `/api/sport-centers/${centerId}/services`,
    payload
  )
  return unwrapObject<SportCenterService>(response.data)
}

export async function updateCenterService(
  centerId: string,
  serviceId: string,
  payload: UpdateServicePayload
): Promise<SportCenterService> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.put(
    `/api/sport-centers/${centerId}/services/${serviceId}`,
    payload
  )
  return unwrapObject<SportCenterService>(response.data)
}

export async function deleteCenterService(
  centerId: string,
  serviceId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/sport-centers/${centerId}/services/${serviceId}`)
}

// ============================================================================
// Products
// ============================================================================

export async function listCenterProducts(
  centerId: string
): Promise<SportCenterProduct[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get(`/api/sport-centers/${centerId}/products`)
  return unwrapArray<SportCenterProduct>(response.data)
}

export async function createCenterProduct(
  centerId: string,
  payload: CreateProductPayload
): Promise<SportCenterProduct> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post(
    `/api/sport-centers/${centerId}/products`,
    payload
  )
  return unwrapObject<SportCenterProduct>(response.data)
}

export async function updateCenterProduct(
  centerId: string,
  productId: string,
  payload: UpdateProductPayload
): Promise<SportCenterProduct> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.put(
    `/api/sport-centers/${centerId}/products/${productId}`,
    payload
  )
  return unwrapObject<SportCenterProduct>(response.data)
}

export async function deleteCenterProduct(
  centerId: string,
  productId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/sport-centers/${centerId}/products/${productId}`)
}

// ============================================================================
// Media upload (images only — png/jpeg/jpg, max 5MB)
// ============================================================================

export async function uploadProductImage(
  file: File
): Promise<MediaUploadResult> {
  const axios = await getAuthenticatedAxios()
  const formData = new FormData()
  formData.append("file", file)

  const response = await axios.post<MediaUploadResult>(
    "/api/media/images",
    formData,
    {
      headers: { "Content-Type": undefined },
    }
  )

  const payload = response.data as
    | MediaUploadResult
    | { data?: MediaUploadResult }
  let result: MediaUploadResult | undefined
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    result = payload.data
  } else {
    result = payload as MediaUploadResult
  }

  if (!result?.url) {
    throw new Error("Upload response missing url")
  }

  return result
}
