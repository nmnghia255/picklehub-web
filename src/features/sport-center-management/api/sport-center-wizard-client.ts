import type {
  CancellationPolicy,
  UpdateCancellationPolicyRequest,
} from "../types/cancellation-policy"
import type { CourtResponse, CreateCourtRequest } from "../types/court"
import type {
  CreateCenterPriceSlotRequest,
  PriceSlot,
  UpdateCenterPriceSlotsRequest,
} from "../types/price-slot"
import type { CreateProductDtoRequest, Product } from "../types/product"
import type { CreateServiceDtoRequest, Service } from "../types/service"
import type {
  CreateSportCenterRequest,
  SportCenter,
  UpdateSportCenterRequest,
} from "../types/sport-center"

type ApiEnvelope<T> = {
  data?: T
  message?: string
  success?: boolean
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = (await response.json()) as T | ApiEnvelope<T>

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as ApiEnvelope<T>).message ?? "Request failed")
        : "Request failed"
    throw new Error(message)
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

export const sportCenterWizardClient = {
  createSportCenter: (request: CreateSportCenterRequest) =>
    requestJson<SportCenter>("/api/sport-centers", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  updateSportCenter: (centerId: string, request: UpdateSportCenterRequest) =>
    requestJson<SportCenter>(`/api/sport-centers/${centerId}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    }),

  getSportCenter: (centerId: string) =>
    requestJson<SportCenter>(`/api/sport-centers/${centerId}`),

  listCourts: (centerId: string) =>
    requestJson<CourtResponse[]>(`/api/sport-centers/${centerId}/courts`),

  createCourt: (centerId: string, request: CreateCourtRequest) =>
    requestJson<CourtResponse>(`/api/sport-centers/${centerId}/courts`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  listPriceSlots: (centerId: string) =>
    requestJson<PriceSlot[]>(`/api/sport-centers/${centerId}/price-slots`),

  createPriceSlot: (centerId: string, request: CreateCenterPriceSlotRequest) =>
    requestJson<PriceSlot>(`/api/sport-centers/${centerId}/price-slots`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  updatePriceSlots: (
    centerId: string,
    request: UpdateCenterPriceSlotsRequest
  ) =>
    requestJson<PriceSlot[]>(`/api/sport-centers/${centerId}/price-slots`, {
      method: "PATCH",
      body: JSON.stringify(request),
    }),

  getCancellationPolicy: (centerId: string) =>
    requestJson<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`
    ),

  updateCancellationPolicy: (
    centerId: string,
    request: UpdateCancellationPolicyRequest
  ) =>
    requestJson<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`,
      {
        method: "PATCH",
        body: JSON.stringify(request),
      }
    ),

  listServices: (centerId: string) =>
    requestJson<Service[]>(`/api/sport-centers/${centerId}/services`),

  createService: (centerId: string, request: CreateServiceDtoRequest) =>
    requestJson<Service>(`/api/sport-centers/${centerId}/services`, {
      method: "POST",
      body: JSON.stringify(request),
    }),

  listProducts: (centerId: string) =>
    requestJson<Product[]>(`/api/sport-centers/${centerId}/products`),

  createProduct: (centerId: string, request: CreateProductDtoRequest) =>
    requestJson<Product>(`/api/sport-centers/${centerId}/products`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
}
