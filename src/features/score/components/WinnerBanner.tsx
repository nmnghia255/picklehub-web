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
  const { handleUndo, sets } = useScoreStore()

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 text-center shadow-sm dark:bg-emerald-950/20">
      <h3 className="text-xl font-black tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
        {t("referee.tracker.gameOverTitle", {
          defaultValue: "Game Over",
        })}
      </h3>
      <p className="text-2xl font-black text-gray-900 dark:text-white">
        {t("referee.tracker.winnerIs", {
          defaultValue: `Winner: ${winnerName}`,
          name: winnerName,
        })}
      </p>

      <div className="flex flex-col items-center gap-1">
        <div className="font-mono text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
          {teamAScore} - {teamBScore}
        </div>
        {sets && sets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
            {sets.map((s, idx) => (
              <span
                key={idx}
                className="rounded bg-neutral-100 px-2 py-0.5 dark:bg-zinc-800"
              >
                {t("referee.tracker.setNumber", {
                  number: idx + 1,
                  defaultValue: `Set ${idx + 1}`,
                })}
                : {s[0]} - {s[1]}
              </span>
            ))}
            <span className="animate-pulse rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t("referee.tracker.setNumber", {
                number: sets.length + 1,
                defaultValue: `Set ${sets.length + 1}`,
              })}
              : {teamAScore} - {teamBScore}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex w-full gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 font-bold"
          onClick={() => handleUndo(isMatchServiceMatch, matchId)}
        >
          {t("referee.tracker.undo", { defaultValue: "Undo" })}
        </Button>

        <Button
          type="button"
          className="h-12 flex-1 rounded-xl bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
          onClick={handleConfirmScore}
          disabled={isSaving}
        >
          {isSaving
            ? t("referee.tracker.savingResult", {
                defaultValue: "Saving...",
              })
            : t("referee.tracker.confirmResult", {
                defaultValue: "Confirm & Save",
              })}
        </Button>
      </div>
    </div>
  )
}
