"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import type { TournamentStatus } from "../../types/tournament"

export function StatusControlPanel({ isEditable }: { isEditable: boolean }) {
  const { t, i18n } = useTournamentTranslation()
  const { tournament, updatingStatus, advanceStatus } =
    useTournamentDashboardStore()

  if (!tournament) return null

  const getNextStatusButtonLabel = (status: TournamentStatus) => {
    switch (status) {
      case "draft":
        return t("dashboard.statusPanel.btn.publish", {
          defaultValue: "Publish Tournament",
        })
      case "published":
        return t("dashboard.statusPanel.btn.openReg", {
          defaultValue: "Open Registration",
        })
      case "open_registration":
        return t("dashboard.statusPanel.btn.closeReg", {
          defaultValue: "Close Registration",
        })
      case "closed_registration":
        return t("dashboard.statusPanel.btn.start", {
          defaultValue: "Start Tournament",
        })
      case "in_progress":
        return t("dashboard.statusPanel.btn.complete", {
          defaultValue: "Complete Tournament",
        })
      default:
        return t("dashboard.statusPanel.btn.update", {
          defaultValue: "Update Status",
        })
    }
  }

  const formatDateWithYear = (dateStr: string | null) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const locale = i18n.language === "vi" ? "vi-VN" : "en-US"
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const handleAdvanceStatus = async () => {
    const res = await advanceStatus(t, formatDateWithYear)
    if (res.success) {
      toast.success(
        t("dashboard.validation.statusUpdated", {
          defaultValue: "Tournament status successfully updated.",
        })
      )
      window.location.reload()
    } else {
      if (res.errors && res.errors.length > 0) {
        res.errors.forEach((err) => toast.error(err))
      } else {
        toast.error(
          res.error ||
            t("dashboard.validation.failedUpdate", {
              defaultValue: "Failed to update tournament status.",
            })
        )
      }
    }
  }

  return (
    <div className="mt-8 mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            {t("dashboard.statusPanel.title", {
              defaultValue: "Tournament Status Control",
            })}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {t("dashboard.statusPanel.currentStatus", {
              defaultValue: "Current Status:",
            })}{" "}
            <span className="font-semibold text-emerald-600 capitalize dark:text-emerald-400">
              {t(`list.statuses.${tournament.status}`)}
            </span>
          </p>
        </div>
        {tournament.status !== "completed" && (
          <Button
            onClick={handleAdvanceStatus}
            disabled={!isEditable || updatingStatus}
            className="bg-emerald-600 font-medium text-white hover:bg-emerald-700"
          >
            {updatingStatus
              ? t("common.saving", { defaultValue: "Saving..." })
              : getNextStatusButtonLabel(tournament.status)}
          </Button>
        )}
      </div>
    </div>
  )
}
