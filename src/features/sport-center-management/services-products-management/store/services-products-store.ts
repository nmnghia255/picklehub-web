"use client"

import { create } from "zustand"

import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import { listOwnerSportCentersAction } from "../../actions/sport-center-actions"
import type { SportCenter } from "../../types/sport-center"
import type { CatalogListResult } from "../api/services-products-service"
// import type { SportCenter } from "@/features/sport-center-management/api/sport-center-service"
// import { listOwnerSportCenters } from "@/features/sport-center-management/api/sport-center-service"
import {
  createCenterProduct,
  createCenterService,
  deleteCenterProduct,
  deleteCenterService,
  listCenterProducts,
  listCenterServices,
  updateCenterProduct,
  updateCenterService,
} from "../api/services-products-service"
import type {
  CreateProductPayload,
  CreateServicePayload,
  SportCenterProduct,
  SportCenterService,
  UpdateProductPayload,
  UpdateServicePayload,
} from "../types"

export type InventoryKind = "service" | "product"
export type StatusFilter = "all" | "active" | "inactive"

function getManagementLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viManagement : enManagement
}

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const status =
    (error as { status?: number }).status ??
    (error as { response?: { status?: number } }).response?.status
  return status === 401 || status === 403
}

function getCatalogErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function getCatalogResultMessage<T>(
  result: CatalogListResult<T>,
  messages: {
    inactive: string
    notFound: string
    permissionDenied: string
  },
  fallback: string
) {
  if (result.ok) return null
  if (result.code === "CENTER_NOT_ACTIVE") return messages.inactive
  if (result.code === "CENTER_NOT_FOUND") return messages.notFound
  if (result.code === "FORBIDDEN") return messages.permissionDenied
  return fallback
}

export type ServicesProductsState = {
  centers: SportCenter[]
  loadingCenters: boolean
  selectedCenterId: string | null

  services: SportCenterService[]
  products: SportCenterProduct[]
  loadingServices: boolean
  loadingProducts: boolean
  saving: boolean
  permissionDenied: boolean
  error: string | null

  serviceSearch: string
  serviceType: string
  serviceStatus: StatusFilter

  productSearch: string
  productType: string
  productStatus: StatusFilter

  fetchCenters: () => Promise<void>
  setSelectedCenter: (centerId: string) => void
  fetchServices: (centerId?: string) => Promise<void>
  fetchProducts: (centerId?: string) => Promise<void>
  fetchAll: (centerId?: string) => Promise<void>

  createService: (
    payload: CreateServicePayload,
    centerId?: string
  ) => Promise<boolean>
  updateService: (
    serviceId: string,
    payload: UpdateServicePayload,
    centerId?: string
  ) => Promise<boolean>
  deleteService: (serviceId: string, centerId?: string) => Promise<boolean>

  createProduct: (
    payload: CreateProductPayload,
    centerId?: string
  ) => Promise<boolean>
  updateProduct: (
    productId: string,
    payload: UpdateProductPayload,
    centerId?: string
  ) => Promise<boolean>
  deleteProduct: (productId: string, centerId?: string) => Promise<boolean>

  setServiceSearch: (value: string) => void
  setServiceType: (value: string) => void
  setServiceStatus: (value: StatusFilter) => void
  setProductSearch: (value: string) => void
  setProductType: (value: string) => void
  setProductStatus: (value: StatusFilter) => void

  clearError: () => void
}

export const useServicesProductsStore = create<ServicesProductsState>(
  (set, get) => ({
    centers: [],
    loadingCenters: false,
    selectedCenterId: null,

    services: [],
    products: [],
    loadingServices: false,
    loadingProducts: false,
    saving: false,
    permissionDenied: false,
    error: null,

    serviceSearch: "",
    serviceType: "all",
    serviceStatus: "all",

    productSearch: "",
    productType: "all",
    productStatus: "all",

    fetchCenters: async () => {
      set({ loadingCenters: true })

      try {
        const centers = await listOwnerSportCentersAction()
        const currentSelection = get().selectedCenterId
        const currentCenter = centers.find(
          (center) => center.id === currentSelection
        )
        const firstActiveCenter = centers.find(
          (center) => center.status === "ACTIVE"
        )
        const selectedCenterId =
          currentCenter?.status === "ACTIVE"
            ? currentCenter.id
            : (firstActiveCenter?.id ?? null)
        set({
          centers,
          selectedCenterId,
          services: [],
          products: [],
          error: null,
        })
      } catch (error) {
        set({
          centers: [],
          selectedCenterId: null,
          services: [],
          products: [],
          error: getCatalogErrorMessage(
            error,
            getManagementLocale().inventory.toast.loadError
          ),
        })
      } finally {
        set({ loadingCenters: false })
      }
    },

    setSelectedCenter: (centerId) => {
      const center = get().centers.find((item) => item.id === centerId)
      if (!center || center.status !== "ACTIVE") {
        set({
          selectedCenterId: null,
          services: [],
          products: [],
          error: getManagementLocale().inventory.center.inactive,
        })
        return
      }
      set({
        selectedCenterId: centerId,
        services: [],
        products: [],
        error: null,
      })
    },

    fetchServices: async (explicitCenterId) => {
      const { centers, selectedCenterId } = get()
      const centerId = explicitCenterId ?? selectedCenterId
      if (!centerId) return

      const selectedCenter = centers.find((center) => center.id === centerId)
      if (!explicitCenterId && selectedCenter?.status !== "ACTIVE") {
        set({ services: [], loadingServices: false, permissionDenied: false })
        return
      }

      set({
        loadingServices: true,
        ...(explicitCenterId ? { services: [] } : {}),
      })

      try {
        const result = await listCenterServices(centerId)
        if (!result.ok) {
          set({
            services: [],
            permissionDenied: result.code === "FORBIDDEN",
            error: getCatalogResultMessage(
              result,
              getManagementLocale().inventory.center,
              getManagementLocale().inventory.toast.loadError
            ),
          })
          return
        }
        set({ services: result.data, permissionDenied: false, error: null })
      } catch (error) {
        const management = getManagementLocale()
        set({
          services: [],
          permissionDenied: isPermissionError(error),
          error: getCatalogErrorMessage(
            error,
            management.inventory.toast.loadError
          ),
        })
      } finally {
        set({ loadingServices: false })
      }
    },

    fetchProducts: async (explicitCenterId) => {
      const { centers, selectedCenterId } = get()
      const centerId = explicitCenterId ?? selectedCenterId
      if (!centerId) return

      const selectedCenter = centers.find((center) => center.id === centerId)
      if (!explicitCenterId && selectedCenter?.status !== "ACTIVE") {
        set({ products: [], loadingProducts: false, permissionDenied: false })
        return
      }

      set({
        loadingProducts: true,
        ...(explicitCenterId ? { products: [] } : {}),
      })

      try {
        const result = await listCenterProducts(centerId)
        if (!result.ok) {
          set({
            products: [],
            permissionDenied: result.code === "FORBIDDEN",
            error: getCatalogResultMessage(
              result,
              getManagementLocale().inventory.center,
              getManagementLocale().inventory.toast.loadError
            ),
          })
          return
        }
        set({ products: result.data, permissionDenied: false, error: null })
      } catch (error) {
        const management = getManagementLocale()
        set({
          products: [],
          permissionDenied: isPermissionError(error),
          error: getCatalogErrorMessage(
            error,
            management.inventory.toast.loadError
          ),
        })
      } finally {
        set({ loadingProducts: false })
      }
    },

    fetchAll: async (centerId) => {
      await Promise.all([
        get().fetchServices(centerId),
        get().fetchProducts(centerId),
      ])
    },

    createService: async (payload, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      set({ saving: true })
      try {
        await createCenterService(centerId, payload)
        await get().fetchServices(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] createService error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.createServiceError })
        return false
      } finally {
        set({ saving: false })
      }
    },

    updateService: async (serviceId, payload, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      set({ saving: true })
      try {
        await updateCenterService(centerId, serviceId, payload)
        await get().fetchServices(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] updateService error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.updateServiceError })
        return false
      } finally {
        set({ saving: false })
      }
    },

    deleteService: async (serviceId, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      try {
        await deleteCenterService(centerId, serviceId)
        await get().fetchServices(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] deleteService error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.deleteServiceError })
        return false
      }
    },

    createProduct: async (payload, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      set({ saving: true })
      try {
        await createCenterProduct(centerId, payload)
        await get().fetchProducts(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] createProduct error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.createProductError })
        return false
      } finally {
        set({ saving: false })
      }
    },

    updateProduct: async (productId, payload, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      set({ saving: true })
      try {
        await updateCenterProduct(centerId, productId, payload)
        await get().fetchProducts(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] updateProduct error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.updateProductError })
        return false
      } finally {
        set({ saving: false })
      }
    },

    deleteProduct: async (productId, explicitCenterId) => {
      const centerId = explicitCenterId ?? get().selectedCenterId
      if (!centerId) return false

      try {
        await deleteCenterProduct(centerId, productId)
        await get().fetchProducts(centerId)
        return true
      } catch (error) {
        console.error("[ServicesProducts] deleteProduct error:", error)
        const management = getManagementLocale()
        set({ error: management.inventory.toast.deleteProductError })
        return false
      }
    },

    setServiceSearch: (serviceSearch) => set({ serviceSearch }),
    setServiceType: (serviceType) => set({ serviceType }),
    setServiceStatus: (serviceStatus) => set({ serviceStatus }),
    setProductSearch: (productSearch) => set({ productSearch }),
    setProductType: (productType) => set({ productType }),
    setProductStatus: (productStatus) => set({ productStatus }),

    clearError: () => set({ error: null }),
  })
)
