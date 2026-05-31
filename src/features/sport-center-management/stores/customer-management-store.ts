import { create } from "zustand"

import { CustomerService } from "@/features/sport-center-management/api/customer-client-service"
import type {
  CustomerListItem,
  CustomerListResponse,
} from "@/features/sport-center-management/types/customer"

interface CustomerManagementState {
  customers: CustomerListItem[]
  isLoading: boolean
  loadError: string | null
  keyword: string
  currentPage: number
  refreshKey: number
  pagination: CustomerListResponse["pagination"] | null
  requestId: number

  setCurrentPage: (page: number) => void
  setKeyword: (value: string) => void
  refreshCustomers: () => void
  resetFilters: () => void
  loadCustomers: (centerId: string | null, pageSize?: number) => Promise<void>
}

export const useCustomerManagementStore = create<CustomerManagementState>(
  (set, get) => ({
    customers: [],
    isLoading: true,
    loadError: null,
    keyword: "",
    currentPage: 1,
    refreshKey: 0,
    pagination: null,
    requestId: 0,

    setCurrentPage: (page) => set({ currentPage: page }),

    setKeyword: (value) =>
      set({
        keyword: value,
        currentPage: 1,
      }),

    refreshCustomers: () =>
      set((state) => ({
        refreshKey: state.refreshKey + 1,
      })),

    resetFilters: () =>
      set({
        keyword: "",
        currentPage: 1,
      }),

    loadCustomers: async (centerId, pageSize = 20) => {
      if (!centerId) {
        set({
          isLoading: false,
          loadError: null,
          customers: [],
          pagination: null,
        })
        return
      }

      const nextRequestId = get().requestId + 1
      set({
        isLoading: true,
        loadError: null,
        requestId: nextRequestId,
      })

      const { keyword, currentPage } = get()

      try {
        const response = await CustomerService.listCustomers({
          centerId,
          keyword: keyword.trim() || null,
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        })

        if (get().requestId !== nextRequestId) return

        set({
          customers: response.data ?? [],
          pagination: response.pagination ?? null,
        })
      } catch (error) {
        if (get().requestId !== nextRequestId) return

        set({
          loadError:
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách khách hàng",
        })
      } finally {
        if (get().requestId === nextRequestId) {
          set({ isLoading: false })
        }
      }
    },
  })
)
