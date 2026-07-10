"use client"

import { Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useScoreStore } from "../stores/use-score-store"

type ScoreFooterProps = {
  isMatchServiceMatch: boolean
  matchId: string | null
  tournamentId: string | null
  handleConfirmScore: () => void
}

export function ScoreFooter({
  isMatchServiceMatch,
  matchId,
  tournamentId,
  handleConfirmScore,
}: ScoreFooterProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const { teamAScore, teamBScore, history, isSaving, matchStatus, handleUndo } =
    useScoreStore()

  const isUndoDisabled = isMatchServiceMatch
    ? teamAScore === 0 && teamBScore === 0
    : history.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse items-stretch justify-end gap-4 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          disabled={isUndoDisabled}
          onClick={() => handleUndo(isMatchServiceMatch, matchId)}
        >
          <Undo2 data-icon="inline-start" />
          {t("referee.tracker.undo", { defaultValue: "Undo" })}
        </Button>
      </div>

      {matchId && (
        <div className="mt-4 border-t pt-6">
          {matchStatus === "CONFIRMED" ? (
            <Button
              type="button"
              className="h-14 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-emerald-700"
              onClick={() => router.push(`/tournaments/${tournamentId}`)}
            >
              {t("referee.tracker.matchFinishedGoBack", {
                defaultValue: "Match Finished. Go Back",
              })}
            </Button>
          ) : (
            <Button
              type="button"
              className="h-14 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-md transition-all duration-200 hover:bg-emerald-700"
              onClick={handleConfirmScore}
              disabled={isSaving}
            >
              {isSaving
                ? t("referee.tracker.savingResult", {
                    defaultValue: "Saving...",
                  })
                : t("referee.tracker.confirmResult", {
                    defaultValue: "Confirm & Save Result",
                  })}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
