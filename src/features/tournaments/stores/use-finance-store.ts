import { create } from "zustand"

import {
  deleteFinanceTransactionAction,
  exportFinanceReportAction,
  getFinanceSummaryAction,
  getFinanceTransactionsAction,
} from "../actions/finance-actions"
import type { Finance, FinanceSummary } from "../types/finance"

interface FinanceState {
  tournamentId: string | null
  summary: FinanceSummary | null
  transactions: Finance[]
  isLoading: boolean
  isExporting: boolean

  // Setters
  setTournamentId: (tournamentId: string) => void

  // Actions
  loadData: () => Promise<void>
  deleteTransaction: (
    transactionId: string
  ) => Promise<{ success: boolean; error?: string }>
  exportReport: (
    format: "pdf" | "excel"
  ) => Promise<{ success: boolean; base64?: string; error?: string }>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  tournamentId: null,
  summary: null,
  transactions: [],
  isLoading: true,
  isExporting: false,

  setTournamentId: (tournamentId) => set({ tournamentId }),

  loadData: async () => {
    const { tournamentId } = get()
    if (!tournamentId) return

    set({ isLoading: true })
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        getFinanceSummaryAction(tournamentId),
        getFinanceTransactionsAction(tournamentId),
      ])

      let summary: FinanceSummary | null = null
      let transactions: Finance[] = []

      if (summaryRes.success && summaryRes.data) {
        summary = summaryRes.data
      }

      if (transactionsRes.success && transactionsRes.data) {
        transactions = transactionsRes.data
      }

      set({ summary, transactions })
    } catch (error) {
      console.error("Error loading financial data:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  deleteTransaction: async (transactionId) => {
    const { tournamentId } = get()
    if (!tournamentId) {
      return { success: false, error: "Tournament ID not set" }
    }

    try {
      const res = await deleteFinanceTransactionAction(
        tournamentId,
        transactionId
      )
      if (res.success) {
        // Refresh local list
        set((state) => ({
          transactions: state.transactions.filter(
            (t) => t.id !== transactionId
          ),
        }))
        // Reload summary as well to update balances
        const summaryRes = await getFinanceSummaryAction(tournamentId)
        if (summaryRes.success && summaryRes.data) {
          set({ summary: summaryRes.data })
        }
        return { success: true }
      }
      return {
        success: false,
        error: res.error || "Failed to delete transaction",
      }
    } catch (err: unknown) {
      console.error(err)
      const errorMsg =
        err instanceof Error ? err.message : "An error occurred while deleting"
      return { success: false, error: errorMsg }
    }
  },

  exportReport: async (format) => {
    const { tournamentId } = get()
    if (!tournamentId) {
      return { success: false, error: "Tournament ID not set" }
    }

    set({ isExporting: true })
    try {
      const res = await exportFinanceReportAction(tournamentId, format)
      if (res.success && res.base64) {
        return { success: true, base64: res.base64 }
      }
      return { success: false, error: res.error || "Failed to export report" }
    } catch (err: unknown) {
      console.error(err)
      const errorMsg =
        err instanceof Error ? err.message : "An error occurred while exporting"
      return { success: false, error: errorMsg }
    } finally {
      set({ isExporting: false })
    }
  },
}))
