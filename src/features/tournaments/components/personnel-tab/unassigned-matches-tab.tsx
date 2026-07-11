import { AlertCircle, Loader2, Search, UserPlus2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { AssignedReferee } from "../../types/referee"
import type { TournamentSchedule } from "../../types/schedule"
import type { TournamentEvent } from "../../types/tournament-event"
import { MatchItemCard } from "./match-item-card"

interface UnassignedMatchesTabProps {
  events: TournamentEvent[]
  filteredUnassignedMatches: AssignedReferee[]
  selectedMatchIds: Set<string>
  isAssigningBulk: boolean
  matchSearch: string
  setMatchSearch: (val: string) => void
  selectedEventId: string
  setSelectedEventId: (val: string) => void
  allFilteredSelected: boolean
  toggleSelectAll: () => void
  toggleMatchSelection: (id: string) => void
  handleBulkAssign: () => void
  isLoadingMatches: boolean
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

export function UnassignedMatchesTab({
  events,
  filteredUnassignedMatches,
  selectedMatchIds,
  isAssigningBulk,
  matchSearch,
  setMatchSearch,
  selectedEventId,
  setSelectedEventId,
  allFilteredSelected,
  toggleSelectAll,
  toggleMatchSelection,
  handleBulkAssign,
  isLoadingMatches,
  scheduleMap,
  formatMatchTime,
  renderTeamDetails,
  isEditable,
}: UnassignedMatchesTabProps) {
  const { t } = useTournamentTranslation()

  return (
    <>
      {/* Search & Event Filters */}
      <div className="flex w-full flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("personnel.assignments.searchPlaceholder")}
              className="w-full bg-white pl-9"
              value={matchSearch}
              onChange={(e) => setMatchSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue
                  placeholder={t("personnel.assignments.allEvents")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("personnel.assignments.allEvents")}
                </SelectItem>
                {events.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id.toString()}>
                    {evt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoadingMatches ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">
            {t("personnel.assignments.loading", {
              defaultValue: "Loading matches list...",
            })}
          </p>
        </div>
      ) : filteredUnassignedMatches.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-gray-50/50 py-12 text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium">
            {t("personnel.assignments.noUnassignedMatches", {
              defaultValue: "No unassigned matches found",
            })}
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Selection Header */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-100/50 bg-emerald-50/20 p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={allFilteredSelected}
                onCheckedChange={toggleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="cursor-pointer text-xs font-semibold text-gray-700 select-none"
              >
                {t("personnel.assignments.selectAll", {
                  defaultValue: "Select All",
                })}{" "}
                ({filteredUnassignedMatches.length})
              </label>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
              disabled={
                selectedMatchIds.size === 0 || isAssigningBulk || !isEditable
              }
              onClick={() => void handleBulkAssign()}
            >
              {isAssigningBulk ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {t("personnel.assignments.assigning", {
                    defaultValue: "Assigning...",
                  })}
                </>
              ) : (
                <>
                  <UserPlus2 className="mr-1.5 h-3.5 w-3.5" />
                  {t("personnel.assignments.assignBulkBtn", {
                    defaultValue: "Assign Selected ({{count}})",
                    count: selectedMatchIds.size,
                  })}
                </>
              )}
            </Button>
          </div>

          {/* Unassigned Matches List */}
          <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
            {filteredUnassignedMatches.map((match) => (
              <MatchItemCard
                key={match.id}
                match={match}
                sched={scheduleMap[String(match.id)]}
                showCheckbox
                checked={selectedMatchIds.has(match.id)}
                onToggleSelection={() => toggleMatchSelection(match.id)}
                formatMatchTime={formatMatchTime}
                renderTeamDetails={renderTeamDetails}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
