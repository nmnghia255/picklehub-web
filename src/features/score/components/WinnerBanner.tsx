"use client"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useScoreStore } from "../stores/use-score-store"

interface WinnerBannerProps {
  winnerName: string
  teamAScore: number
  teamBScore: number
  isMatchServiceMatch: boolean
  matchId: string | null
  handleConfirmScore: () => void
  isSaving: boolean
}

export function WinnerBanner({
  winnerName,
  teamAScore,
  teamBScore,
  isMatchServiceMatch,
  matchId,
  handleConfirmScore,
  isSaving,
}: WinnerBannerProps) {
  const { t } = useTournamentTranslation()
  const { handleUndo, applyReset } = useScoreStore()

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 text-center shadow-sm dark:bg-emerald-950/20">
      <div className="text-5xl">🏆</div>
      <h3 className="text-xl font-black tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
        {t("referee.tracker.gameOverTitle", {
          defaultValue: "Trận đấu kết thúc",
        })}
      </h3>
      <p className="text-2xl font-black text-gray-900 dark:text-white">
        {t("referee.tracker.winnerIs", {
          defaultValue: `Chiến thắng: ${winnerName}`,
          name: winnerName,
        })}
      </p>
      <div className="font-mono text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
        {teamAScore} - {teamBScore}
      </div>

      <div className="mt-4 flex w-full gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 font-bold"
          onClick={() => handleUndo(isMatchServiceMatch, matchId)}
        >
          🔄 {t("referee.tracker.undo", { defaultValue: "Hoàn tác (Undo)" })}
        </Button>

        <Button
          type="button"
          className="h-12 flex-1 rounded-xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
          onClick={handleConfirmScore}
          disabled={isSaving}
        >
          {isSaving
            ? t("referee.tracker.savingResult", {
                defaultValue: "Đang lưu...",
              })
            : t("referee.tracker.confirmResult", {
                defaultValue: "Xác nhận & Lưu kết quả",
              })}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 text-xs font-medium text-gray-500 hover:text-red-600"
        onClick={applyReset}
      >
        🔄{" "}
        {t("referee.tracker.resetMatch", {
          defaultValue: "Đặt lại trận đấu (Reset)",
        })}
      </Button>
    </div>
  )
}
