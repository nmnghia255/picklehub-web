"use client"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useScoreStore } from "../stores/use-score-store"

export function CourtControls() {
  const { t } = useTournamentTranslation()
  const {
    teamAName,
    teamBName,
    setIsA1Right,
    setIsB1Right,
    setIsSwappedSides,
  } = useScoreStore()

  return (
    <div className="flex flex-wrap justify-center gap-3 rounded-xl border bg-muted/30 p-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsSwappedSides((prev) => !prev)}
        className="text-xs font-bold hover:bg-muted"
      >
        🔄 {t("referee.tracker.swapEnds")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsA1Right((prev) => !prev)}
        className="text-xs font-bold hover:bg-muted"
      >
        🔄{" "}
        {t("referee.tracker.swapPositions", {
          team: teamAName,
        })}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsB1Right((prev) => !prev)}
        className="text-xs font-bold hover:bg-muted"
      >
        🔄{" "}
        {t("referee.tracker.swapPositions", {
          team: teamBName,
        })}
      </Button>
    </div>
  )
}
