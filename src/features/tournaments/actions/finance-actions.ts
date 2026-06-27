"use server"

import axios from "axios"

import { TournamentFinanceService } from "../api/finance-service"

export async function getFinanceTransactionsAction(tournamentId: string) {
  try {
    const data =
      await TournamentFinanceService.getFinanceTransactions(tournamentId)
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to get finance transactions:", error)
    let errorMessage = "Failed to load transactions"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
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
    let errorMessage = "Failed to load finance summary"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
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
    let errorMessage = "Failed to export report"
    if (axios.isAxiosError(error)) {
      if (error.response?.data instanceof ArrayBuffer) {
        try {
          const decoded = Buffer.from(error.response.data).toString("utf-8")
          const parsed = JSON.parse(decoded)
          errorMessage = parsed.message || errorMessage
        } catch {
          // Ignore parsing error, keep fallback
        }
      } else {
        errorMessage = error.response?.data?.message || error.message
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false as const, error: errorMessage }
  }
}
