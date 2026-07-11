import { AlertCircle, Loader2, UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { AssignedReferee } from "../../types/referee"
import type { TournamentSchedule } from "../../types/schedule"
import { MatchItemCard } from "./match-item-card"

interface AssignedMatchesTabProps {
  refereeAssignments: AssignedReferee[]
  isLoadingMatches: boolean
  handleUnassignReferee: (id: string) => void
  scheduleMap: Record<string, TournamentSchedule>
  formatMatchTime: (
    startTimeStr: string | null | undefined,
    endTimeStr?: string | null | undefined,
    durationMinutes?: number | null
  ) => string
  renderTeamDetails: (
    matchId: string,
    teamId: string | null | undefined,
    isTeam1: boolean
  ) => React.ReactNode
  isEditable: boolean
}

export function AssignedMatchesTab({
  refereeAssignments,
  isLoadingMatches,
  handleUnassignReferee,
  scheduleMap,
  formatMatchTime,
  renderTeamDetails,
  isEditable,
}: AssignedMatchesTabProps) {
  const { t } = useTournamentTranslation()

  return (
    <>
      {isLoadingMatches ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">
            {t("personnel.assignments.loading", {
              defaultValue: "Loading matches list...",
            })}
          </p>
        </div>
      ) : refereeAssignments.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-gray-50/50 py-12 text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium">
            {t("personnel.assignments.noAssignments", {
              defaultValue: "This referee has no matches assigned yet.",
            })}
          </p>
        </div>
      ) : (
        <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
          {refereeAssignments.map((match) => (
            <MatchItemCard
              key={match.id}
              match={match}
              sched={scheduleMap[String(match.id)]}
              formatMatchTime={formatMatchTime}
              renderTeamDetails={renderTeamDetails}
              actionButton={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-xs font-semibold text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => void handleUnassignReferee(match.id)}
                  disabled={!isEditable}
                >
                  <UserMinus className="mr-1 h-3.5 w-3.5" />
                  {t("personnel.assignments.unassignConfirmBtn", {
                    defaultValue: "Remove",
                  })}
                </Button>
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
