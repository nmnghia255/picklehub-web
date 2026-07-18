"use server"

import axios from "axios"

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
  throw new Error(
    "Expected an array response from the Sport Center catalog API"
  )
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

function rethrowCatalogError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined
    const normalized = new Error(responseData?.message ?? fallback)
    Object.assign(normalized, { status: error.response?.status })
    throw normalized
  }

  throw error instanceof Error ? error : new Error(fallback)
}

export type CatalogListResult<T> =
  | { ok: true; data: T[] }
  | {
      ok: false
      code:
        | "CENTER_NOT_FOUND"
        | "CENTER_NOT_ACTIVE"
        | "FORBIDDEN"
        | "REQUEST_FAILED"
      status?: number
      message: string
    }

function catalogListFailure(
  error: unknown,
  fallback: string
): CatalogListResult<never> {
  try {
    rethrowCatalogError(error, fallback)
  } catch (normalizedError) {
    const status =
      normalizedError && typeof normalizedError === "object"
        ? (normalizedError as { status?: number }).status
        : undefined
    const message =
      normalizedError instanceof Error ? normalizedError.message : fallback
    const lowerMessage = message.toLowerCase()
    const code =
      status === 403
        ? "FORBIDDEN"
        : status === 404 && lowerMessage.includes("active")
          ? "CENTER_NOT_ACTIVE"
          : status === 404
            ? "CENTER_NOT_FOUND"
            : "REQUEST_FAILED"
    return { ok: false, code, status, message }
  }

  return { ok: false, code: "REQUEST_FAILED", message: fallback }
}

// ============================================================================
// Services
// ============================================================================

export async function listCenterServices(
  centerId: string
): Promise<CatalogListResult<SportCenterService>> {
  if (!centerId.trim()) {
    return {
      ok: false,
      code: "CENTER_NOT_FOUND",
      message: "Sport Center ID is required",
    }
  }

  try {
    const client = await getAuthenticatedAxios()
    const response = await client.get(`/api/sport-centers/${centerId}/services`)
    return { ok: true, data: unwrapArray<SportCenterService>(response.data) }
  } catch (error) {
    return catalogListFailure(error, "Failed to load services")
  }
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
): Promise<CatalogListResult<SportCenterProduct>> {
  if (!centerId.trim()) {
    return {
      ok: false,
      code: "CENTER_NOT_FOUND",
      message: "Sport Center ID is required",
    }
  }

  try {
    const client = await getAuthenticatedAxios()
    const response = await client.get(`/api/sport-centers/${centerId}/products`)
    return { ok: true, data: unwrapArray<SportCenterProduct>(response.data) }
  } catch (error) {
    return catalogListFailure(error, "Failed to load products")
  }
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
