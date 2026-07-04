"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useScoreStore } from "../stores/use-score-store"

type SyncOverlayProps = {
  isMatchServiceMatch: boolean
}

export function SyncOverlay({ isMatchServiceMatch }: SyncOverlayProps) {
  const { t } = useTournamentTranslation()
  const { isConnected, isSyncing } = useScoreStore()

  if (!isMatchServiceMatch || (isConnected && !isSyncing)) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm select-none">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-xl">
        {!isConnected ? (
          <>
            <span className="animate-bounce text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-destructive">
              {t("referee.tracker.disconnected", {
                defaultValue: "Mất kết nối...",
              })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("referee.tracker.disconnectedDesc", {
                defaultValue: "Vui lòng kiểm tra lại kết nối mạng của bạn.",
              })}
            </p>
          </>
        ) : (
          <>
            <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <h3 className="text-lg font-bold text-foreground">
              {t("referee.tracker.syncing", {
                defaultValue: "Đang đồng bộ...",
              })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("referee.tracker.syncingDesc", {
                defaultValue: "Đang khôi phục và đồng bộ điểm số mới nhất.",
              })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
