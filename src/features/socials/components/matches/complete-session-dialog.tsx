"use client"

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import React, { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CompletePlaySessionResponse } from "@/features/socials/types/match"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface CompleteSessionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirmComplete: () => Promise<CompletePlaySessionResponse | void>
  unscoredMatchesCount: number
  totalMatchesCount: number
}

export function CompleteSessionDialog({
  isOpen,
  onClose,
  onConfirmComplete,
  unscoredMatchesCount,
  totalMatchesCount,
}: CompleteSessionDialogProps) {
  const { t } = useSocialsTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completeResult, setCompleteResult] =
    useState<CompletePlaySessionResponse | null>(null)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const res = await onConfirmComplete()
      if (res) {
        setCompleteResult(res)
      } else {
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDone = () => {
    setCompleteResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {completeResult
              ? t(
                  "matches.completeSession.successTitle",
                  "Ca Chơi Đã Hoàn Tất!"
                )
              : t("matches.completeSession.title", "Xác Nhận Kết Thúc Ca Chơi")}
          </DialogTitle>
          <DialogDescription>
            {completeResult
              ? t("matches.completeSession.successText")
              : t("matches.completeSession.description")}
          </DialogDescription>
        </DialogHeader>

        {completeResult ? (
          <div className="space-y-4 py-2">
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="font-semibold">
                Hoàn thành thành công
              </AlertTitle>
              <AlertDescription className="mt-1 text-xs">
                Tổng số vòng: {completeResult.summary?.totalRounds || 0} | Số
                trận đã xong: {completeResult.summary?.completedMatches || 0} |
                Trận bị hủy: {completeResult.summary?.cancelledMatches || 0}
              </AlertDescription>
            </Alert>

            {completeResult.leaderboard &&
              completeResult.leaderboard.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    🏆 Bảng Xếp Hạng Ca Chơi
                  </h4>
                  <div className="max-h-48 divide-y overflow-y-auto rounded-lg border text-xs">
                    {completeResult.leaderboard.map((item, idx) => (
                      <div
                        key={item.userId || idx}
                        className="flex items-center justify-between p-2.5 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold">{item.fullName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span>
                            {item.wins} Thắng - {item.losses} Thua
                          </span>
                          <span className="font-bold text-emerald-600">
                            {Math.round((item.winRate || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {unscoredMatchesCount > 0 ? (
              <Alert
                variant="destructive"
                className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              >
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="font-bold">
                  {t("matches.completeSession.warningTitle")}
                </AlertTitle>
                <AlertDescription className="mt-1.5 text-xs leading-relaxed">
                  {t("matches.completeSession.warningText", {
                    unscoredCount: unscoredMatchesCount,
                    totalCount: totalMatchesCount,
                  })}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <AlertTitle className="font-bold">
                  {t("matches.completeSession.successTitle")}
                </AlertTitle>
                <AlertDescription className="mt-1 text-xs">
                  {t("matches.completeSession.successText")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {completeResult ? (
            <Button className="w-full" onClick={handleDone}>
              {t("common.close", "Đóng")}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t("matches.completeSession.cancelBtn")}
              </Button>
              <Button
                variant={unscoredMatchesCount > 0 ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("matches.completeSession.confirmBtn")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
