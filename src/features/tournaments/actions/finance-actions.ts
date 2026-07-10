"use server"

import axios from "axios"

import { TournamentFinanceService } from "../api/finance-service"
import type { FinanceRequest } from "../types/finance"

export async function getFinanceTransactionsAction(tournamentId: string) {
  try {
    const data =
      await TournamentFinanceService.getFinanceTransactions(tournamentId)
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to get finance transactions:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function getFinanceSummaryAction(tournamentId: string) {
  try {
    const data = await TournamentFinanceService.getFinanceSummary(tournamentId)
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to get finance summary:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function exportFinanceReportAction(
  tournamentId: string,
  format: "pdf" | "excel"
) {
  try {
    const arrayBuffer = await TournamentFinanceService.exportFinanceReport(
      tournamentId,
      format
    )
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    return { success: true as const, base64 }
  } catch (error: unknown) {
    console.error("Failed to export finance report:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      if (error.response?.data instanceof ArrayBuffer) {
        try {
          const decoded = Buffer.from(error.response.data).toString("utf-8")
          const parsed = JSON.parse(decoded)
          errorMessage = parsed.message || ""
        } catch {
          // Ignore parsing error, keep backend-safe fallback
        }
      } else {
        errorMessage = error.response?.data?.message || ""
      }
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function createFinanceTransactionAction(
  tournamentId: string,
  finance: FinanceRequest
) {
  try {
    const data = await TournamentFinanceService.createFinanceTransaction(
      tournamentId,
      finance
    )
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to create finance transaction:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function deleteFinanceTransactionAction(
  tournamentId: string,
  transactionId: string
) {
  try {
    await TournamentFinanceService.deleteFinanceTransaction(
      tournamentId,
      transactionId
    )
    return { success: true as const }
  } catch (error: unknown) {
    console.error("Failed to delete finance transaction:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false as const, error: errorMessage }
  }
}
