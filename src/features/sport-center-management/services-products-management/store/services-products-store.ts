"use client"

import { create } from "zustand"

import { listOwnerSportCentersAction } from "../../actions/sport-center-actions"
import type { SportCenter } from "../../types/sport-center"
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

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const status = (error as { response?: { status?: number } }).response?.status
  return status === 401 || status === 403
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
  fetchServices: () => Promise<void>
  fetchProducts: () => Promise<void>
  fetchAll: () => Promise<void>

  createService: (payload: CreateServicePayload) => Promise<boolean>
  updateService: (
    serviceId: string,
    payload: UpdateServicePayload
  ) => Promise<boolean>
  deleteService: (serviceId: string) => Promise<boolean>

  createProduct: (payload: CreateProductPayload) => Promise<boolean>
  updateProduct: (
    productId: string,
    payload: UpdateProductPayload
  ) => Promise<boolean>
  deleteProduct: (productId: string) => Promise<boolean>

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
        set({ centers })

        const { selectedCenterId } = get()
        if (!selectedCenterId && centers.length > 0) {
          set({ selectedCenterId: centers[0].id })
        }
      } catch (error) {
        console.error("[ServicesProducts] fetchCenters error:", error)
        set({ centers: [] })
      } finally {
        set({ loadingCenters: false })
      }
    },

    setSelectedCenter: (centerId) =>
      set({ selectedCenterId: centerId, services: [], products: [] }),

    fetchServices: async () => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return

      set({ loadingServices: true })

      try {
        const services = await listCenterServices(selectedCenterId)
        set({ services, permissionDenied: false })
      } catch (error) {
        console.error("[ServicesProducts] fetchServices error:", error)
        set({
          services: [],
          permissionDenied: isPermissionError(error),
          error: "Không thể tải danh sách dịch vụ.",
        })
      } finally {
        set({ loadingServices: false })
      }
    },

    fetchProducts: async () => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return

      set({ loadingProducts: true })

      try {
        const products = await listCenterProducts(selectedCenterId)
        set({ products, permissionDenied: false })
      } catch (error) {
        console.error("[ServicesProducts] fetchProducts error:", error)
        set({
          products: [],
          permissionDenied: isPermissionError(error),
          error: "Không thể tải danh sách sản phẩm.",
        })
      } finally {
        set({ loadingProducts: false })
      }
    },

    fetchAll: async () => {
      await Promise.all([get().fetchServices(), get().fetchProducts()])
    },

    createService: async (payload) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      set({ saving: true })
      try {
        await createCenterService(selectedCenterId, payload)
        await get().fetchServices()
        return true
      } catch (error) {
        console.error("[ServicesProducts] createService error:", error)
        set({ error: "Không thể tạo dịch vụ." })
        return false
      } finally {
        set({ saving: false })
      }
    },

    updateService: async (serviceId, payload) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      set({ saving: true })
      try {
        await updateCenterService(selectedCenterId, serviceId, payload)
        await get().fetchServices()
        return true
      } catch (error) {
        console.error("[ServicesProducts] updateService error:", error)
        set({ error: "Không thể cập nhật dịch vụ." })
        return false
      } finally {
        set({ saving: false })
      }
    },

    deleteService: async (serviceId) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      try {
        await deleteCenterService(selectedCenterId, serviceId)
        await get().fetchServices()
        return true
      } catch (error) {
        console.error("[ServicesProducts] deleteService error:", error)
        set({ error: "Không thể xóa dịch vụ." })
        return false
      }
    },

    createProduct: async (payload) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      set({ saving: true })
      try {
        await createCenterProduct(selectedCenterId, payload)
        await get().fetchProducts()
        return true
      } catch (error) {
        console.error("[ServicesProducts] createProduct error:", error)
        set({ error: "Không thể tạo sản phẩm." })
        return false
      } finally {
        set({ saving: false })
      }
    },

    updateProduct: async (productId, payload) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      set({ saving: true })
      try {
        await updateCenterProduct(selectedCenterId, productId, payload)
        await get().fetchProducts()
        return true
      } catch (error) {
        console.error("[ServicesProducts] updateProduct error:", error)
        set({ error: "Không thể cập nhật sản phẩm." })
        return false
      } finally {
        set({ saving: false })
      }
    },

    deleteProduct: async (productId) => {
      const { selectedCenterId } = get()
      if (!selectedCenterId) return false

      try {
        await deleteCenterProduct(selectedCenterId, productId)
        await get().fetchProducts()
        return true
      } catch (error) {
        console.error("[ServicesProducts] deleteProduct error:", error)
        set({ error: "Không thể xóa sản phẩm." })
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
