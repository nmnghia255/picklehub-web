import { Clock, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import type { AssignedReferee } from "../../types/referee"
import type { TournamentSchedule } from "../../types/schedule"

interface MatchItemCardProps {
  match: AssignedReferee
  sched: TournamentSchedule | undefined
  showCheckbox?: boolean
  checked?: boolean
  onToggleSelection?: () => void
  actionButton?: React.ReactNode
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
}

export function MatchItemCard({
  match,
  sched,
  showCheckbox = false,
  checked = false,
  onToggleSelection,
  actionButton,
  formatMatchTime,
  renderTeamDetails,
}: MatchItemCardProps) {
  const { t } = useTournamentTranslation()

  const matchTime = sched?.startTime || match.startTime || match.time
  const matchCourt = sched?.court || match.court?.name

  return (
    <Card
      className={cn(
        "border bg-white p-4 transition-all duration-200",
        showCheckbox && "cursor-pointer hover:bg-gray-50/20",
        showCheckbox && checked
          ? "border-emerald-500 bg-emerald-50/5"
          : "border-gray-200"
      )}
      onClick={showCheckbox ? onToggleSelection : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
          {showCheckbox && (
            <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={checked} onCheckedChange={onToggleSelection} />
            </div>
          )}
          <div className="flex-1 space-y-2">
            {/* Badges metadata row */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
              <Badge
                variant="outline"
                className="border-emerald-100 bg-emerald-50/50 text-[10px] font-semibold text-emerald-800"
              >
                {match.event?.name || t("personnel.assignments.eventLabel")}
              </Badge>
              <Badge
                variant="outline"
                className="bg-gray-50 text-[10px] font-medium text-gray-600"
              >
                {match.round || t("personnel.assignments.roundLabel")}
              </Badge>
              {matchCourt && (
                <span className="flex items-center gap-0.5 text-gray-500">
                  <MapPin className="h-3 w-3 text-red-400" />
                  {matchCourt}
                </span>
              )}
              {matchTime && (
                <span className="flex items-center gap-0.5 text-gray-500">
                  <Clock className="h-3 w-3 text-blue-400" />
                  {formatMatchTime(
                    matchTime,
                    sched?.endTime != null ? String(sched.endTime) : undefined,
                    match.duration
                  )}
                </span>
              )}
            </div>
            {/* Team vs Team layout */}
            <div className="flex items-center gap-6 text-sm font-semibold text-gray-900">
              <div className="min-w-0 flex-1">
                {renderTeamDetails(match.id, match.team1Id, true)}
              </div>
              <span className="self-center text-xs font-bold text-gray-400">
                VS
              </span>
              <div className="min-w-0 flex-1">
                {renderTeamDetails(match.id, match.team2Id, false)}
              </div>
            </div>
          </div>
        </div>

        {actionButton && <div className="self-center">{actionButton}</div>}
      </div>
    </Card>
  )
}
