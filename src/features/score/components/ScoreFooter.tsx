"use client"

import { Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useScoreTranslation } from "@/i18n/use-score-translation"

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
  const { t } = useScoreTranslation()
  const router = useRouter()
  const {
    teamAScore,
    teamBScore,
    history,
    isSaving,
    matchStatus,
    handleUndo,
    applyReset,
  } = useScoreStore()

  const isUndoDisabled = isMatchServiceMatch
    ? teamAScore === 0 && teamBScore === 0
    : history.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="text-muted-foreground"
            >
              {t("tracker.resetMatch")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("tracker.resetConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("tracker.resetConfirmDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">
                {t("tracker.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                onClick={() => {
                  void applyReset(isMatchServiceMatch, matchId)
                }}
              >
                {t("tracker.reset")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          type="button"
          variant="outline"
          disabled={isUndoDisabled}
          onClick={() => handleUndo(isMatchServiceMatch, matchId)}
        >
          <Undo2 data-icon="inline-start" />
          {t("tracker.undo")}
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
              {t("tracker.matchFinishedGoBack", {
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
                ? t("tracker.savingResult", {
                    defaultValue: "Saving...",
                  })
                : t("tracker.confirmResult", {
                    defaultValue: "Confirm & Save Result",
                  })}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
