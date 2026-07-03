"use client"

import { Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface PreviewBannerProps {
  previewMatchesCount: number
  isConfirming: boolean
  onAdjustConfig: () => void
  onCancelPreview: () => void
  onConfirmPreview: () => void
}

export function PreviewBanner({
  previewMatchesCount,
  isConfirming,
  onAdjustConfig,
  onCancelPreview,
  onConfirmPreview,
}: PreviewBannerProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="flex animate-in flex-col justify-between gap-4 bg-indigo-600 px-6 py-4 text-white shadow-md duration-300 slide-in-from-top md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <div className="animate-pulse rounded-lg bg-indigo-500 p-2">
          <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
        </div>
        <div>
          <h4 className="text-sm font-bold">
            {t("scheduling.preview.title", {
              defaultValue: "Auto-Scheduling Preview Active",
            })}
          </h4>
          <p className="mt-0.5 text-xs text-indigo-100">
            {t("scheduling.preview.description", {
              count: previewMatchesCount,
              defaultValue: `Showing estimated allocation for ${previewMatchesCount} matches. Review the dashed cards on the grid below.`,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-9 border-indigo-500 bg-indigo-700 px-4 text-xs text-white hover:bg-indigo-800"
          onClick={onAdjustConfig}
          disabled={isConfirming}
        >
          {t("scheduling.preview.btnAdjust", {
            defaultValue: "Adjust Config",
          })}
        </Button>
        <Button
          variant="outline"
          className="h-9 border-transparent bg-transparent px-3 text-xs text-indigo-100 hover:bg-indigo-700 hover:text-white"
          onClick={onCancelPreview}
          disabled={isConfirming}
        >
          {t("scheduling.preview.btnCancel", {
            defaultValue: "Cancel Preview",
          })}
        </Button>
        <Button
          className="flex h-9 items-center gap-1.5 bg-emerald-500 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
          onClick={onConfirmPreview}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("scheduling.preview.applying", {
                defaultValue: "Applying...",
              })}
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              {t("scheduling.preview.btnConfirm", {
                defaultValue: "Confirm & Run Auto-Scheduling",
              })}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
