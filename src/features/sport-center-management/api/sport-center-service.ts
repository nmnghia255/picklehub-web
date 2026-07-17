import { getAuthenticatedAxios } from "@/lib/server-api"

import type { CancellationPolicy } from "../types/cancellation-policy"
import type { CourtResponse, CreateCourtRequest } from "../types/court"
import type {
  AddPriceSlotRequest,
  CreateCenterPriceSlotRequest,
  PriceSlot,
  UpdateCenterPriceSlotsRequest,
  UpdatePriceSlotRequest,
} from "../types/price-slot"
import type { CreateProductDtoRequest, Product } from "../types/product"
import type { CreateServiceDtoRequest, Service } from "../types/service"
import type {
  CreateSportCenterRequest,
  SportCenter,
  UpdateSportCenterRequest,
} from "../types/sport-center"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset: number
    limit: number
  }
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const SportCenterOwnerService = {
  createSportCenter: async function createSportCenter(
    request: CreateSportCenterRequest
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<SportCenter>(
      "/api/sport-centers",
      request
    )
    return unwrapApiResponse(response.data)
  },

  listOwnerSportCenters: async function listOwnerSportCenters(): Promise<
    SportCenter[]
  > {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<SportCenter[]>("/api/sport-centers/me")

    return unwrapApiResponse(response.data)
  },

  getSportCenterDetails: async function getSportCenterDetails(
    centerId: string
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<SportCenter>(
      `/api/sport-centers/${centerId}`
    )
    return unwrapApiResponse(response.data)
  },

  listCourts: async function listCourts(
    centerId: string,
    params?: Record<string, string>
  ): Promise<CourtResponse[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<CourtResponse[]>(
      `/api/sport-centers/${centerId}/courts`,
      { params }
    )
    return unwrapApiResponse(response.data)
  },

  updateSportCenter: async function updateSportCenter(
    centerId: string,
    request: UpdateSportCenterRequest
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<SportCenter>(
      `/api/sport-centers/${centerId}`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  createCourt: async function createCourt(
    centerId: string,
    request: CreateCourtRequest
  ): Promise<CourtResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<CourtResponse>(
      `/api/sport-centers/${centerId}/courts`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  createPriceSlot: async function createPriceSlot(
    centerId: string,
    request: CreateCenterPriceSlotRequest
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  listPriceSlots: async function listPriceSlots(
    centerId: string
  ): Promise<PriceSlot[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<PriceSlot[]>(
      `/api/sport-centers/${centerId}/price-slots`
    )
    return unwrapApiResponse(response.data)
  },

  updatePriceSlots: async function updatePriceSlots(
    centerId: string,
    request: UpdateCenterPriceSlotsRequest
  ): Promise<PriceSlot[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<PriceSlot[]>(
      `/api/sport-centers/${centerId}/price-slots`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  deleteSportCenter: async function deleteSportCenter(
    centerId: string
  ): Promise<SportCenter> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<SportCenter>(
      `/api/sport-centers/${centerId}`
    )
    return unwrapApiResponse(response.data)
  },

  addPriceSlot: async function addPriceSlot(
    centerId: string,
    priceSlot: AddPriceSlotRequest
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots`,
      priceSlot
    )
    return unwrapApiResponse(response.data)
  },

  updatePriceSlot: async function updatePriceSlot(
    centerId: string,
    priceSlot: UpdatePriceSlotRequest
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots`,
      priceSlot
    )
    return unwrapApiResponse(response.data)
  },

  deletePriceSlot: async function deletePriceSlot(
    centerId: string,
    priceSlotId: string
  ): Promise<PriceSlot> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<PriceSlot>(
      `/api/sport-centers/${centerId}/price-slots/${priceSlotId}`
    )
    return unwrapApiResponse(response.data)
  },

  getCancellationPolicy: async function getCancellationPolicy(
    centerId: string
  ): Promise<CancellationPolicy> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`
    )
    return unwrapApiResponse(response.data)
  },

  updateCancellationPolicy: async function updateCancellationPolicy(
    centerId: string,
    policy: CancellationPolicy
  ): Promise<CancellationPolicy> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<CancellationPolicy>(
      `/api/sport-centers/${centerId}/cancellation-policy`,
      policy
    )
    return unwrapApiResponse(response.data)
  },

  listServices: async function listServices(
    centerId: string
  ): Promise<Service[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<Service[]>(
      `/api/sport-centers/${centerId}/services`
    )
    return unwrapApiResponse(response.data)
  },

  createService: async function createService(
    centerId: string,
    request: CreateServiceDtoRequest
  ): Promise<Service> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Service>(
      `/api/sport-centers/${centerId}/services`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  listProducts: async function listProducts(
    centerId: string
  ): Promise<Product[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<Product[]>(
      `/api/sport-centers/${centerId}/products`
    )
    return unwrapApiResponse(response.data)
  },

  createProduct: async function createProduct(
    centerId: string,
    request: CreateProductDtoRequest
  ): Promise<Product> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Product>(
      `/api/sport-centers/${centerId}/products`,
      request
    )
    return unwrapApiResponse(response.data)
  },
}
