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
    isDoubles,
  } = useScoreStore()

  return (
    <div className="flex flex-wrap justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsSwappedSides((prev) => !prev)}
        className="border-gray-200 text-xs font-bold hover:bg-muted"
      >
        {t("referee.tracker.swapEnds", {
          defaultValue: "Đổi bên sân (Swap Sides)",
        })}
      </Button>

      {isDoubles && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsA1Right((prev) => !prev)}
            className="border-gray-200 text-xs font-bold hover:bg-muted"
          >
            {t("referee.tracker.swapPositions", {
              team: teamAName,
              defaultValue: `Đổi vị trí ${teamAName}`,
            })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsB1Right((prev) => !prev)}
            className="border-gray-200 text-xs font-bold hover:bg-muted"
          >
            {t("referee.tracker.swapPositions", {
              team: teamBName,
              defaultValue: `Đổi vị trí ${teamBName}`,
            })}
          </Button>
        </>
      )}
    </div>
  )
}
