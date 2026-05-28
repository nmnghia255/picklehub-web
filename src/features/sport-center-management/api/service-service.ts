import { getAuthenticatedAxios } from "@/lib/server-api"

import { Court } from "../types/court"
import type { Service, ServiceRequest } from "../types/service"

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

export const ServiceService = {
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
    serviceData: ServiceRequest
  ): Promise<Service> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Service>(
      `/api/sport-centers/${centerId}/services`,
      serviceData
    )
    return unwrapApiResponse(response.data)
  },

  updateService: async function updateService(
    centerId: string,
    serviceId: string,
    serviceData: ServiceRequest
  ): Promise<Service> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<Service>(
      `/api/sport-centers/${centerId}/services/${serviceId}`,
      serviceData
    )
    return unwrapApiResponse(response.data)
  },

  deleteService: async function deleteService(
    centerId: string,
    serviceId: string
  ): Promise<Service> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<Service>(
      `/api/sport-centers/${centerId}/services/${serviceId}`
    )
    return unwrapApiResponse(response.data)
  },
}
