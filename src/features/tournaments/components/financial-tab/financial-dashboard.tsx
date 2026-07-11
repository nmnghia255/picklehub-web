"use client"

import { Download, FileText, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useFinanceStore } from "../../stores/use-finance-store"
import { OtherTransactionsTable } from "./other-transactions-table"
import { RegistrationFeeTable } from "./registration-fee-table"
import { SummaryCards } from "./summary-cards"

interface FinancialDashboardProps {
  tournamentId: string
  isEditable: boolean
}

export function FinancialDashboard({
  tournamentId,
  isEditable,
}: FinancialDashboardProps) {
  const { t } = useTournamentTranslation()
  const { setTournamentId, loadData, isLoading, isExporting, exportReport } =
    useFinanceStore()

  useEffect(() => {
    setTournamentId(tournamentId)

    loadData()
  }, [tournamentId, setTournamentId, loadData])

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const res = await exportReport(format)
      if (res.success && res.base64) {
        const byteCharacters = atob(res.base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const contentType =
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        const fileBlob = new Blob([byteArray], { type: contentType })
        const url = window.URL.createObjectURL(fileBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = `finance-report-${tournamentId}.${
          format === "pdf" ? "pdf" : "xlsx"
        }`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success(
          t("financials.exportSuccess", {
            format: format.toUpperCase(),
            defaultValue: `Exported ${format.toUpperCase()} report successfully!`,
          })
        )
      } else {
        toast.error(
          res.error ||
            t("financials.exportError", {
              defaultValue: "Failed to export report",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("financials.exportError", {
          defaultValue: "Failed to export report",
        })
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900 dark:text-zinc-100">
                {t("financials.title")}
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                {t("financials.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                disabled={isExporting}
                onClick={() => handleExport("pdf")}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("financials.exportPdf")}
              </Button>
              <Button
                variant="outline"
                disabled={isExporting}
                onClick={() => handleExport("excel")}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("financials.exportExcel")}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* Tables */}
        <div className="space-y-8">
          <RegistrationFeeTable />
          <OtherTransactionsTable isEditable={isEditable} />
        </div>
      </div>
    </div>
  )
}
