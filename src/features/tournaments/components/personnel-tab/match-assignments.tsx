"use client"

import {
  AlertCircle,
  Clock,
  Loader2,
  MapPin,
  Search,
  Shield,
  UserMinus,
  UserPlus2,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { TournamentEvent } from "../../types/tournament-event"

interface MatchAssignmentsProps {
  events: TournamentEvent[]
}

export function MatchAssignments({ events }: MatchAssignmentsProps) {
  const { t } = useTournamentTranslation()

  // Store Hooks
  const referees = usePersonnelStore((s) => s.referees)
  const matches = usePersonnelStore((s) => s.matches)
  const isLoadingMatches = usePersonnelStore((s) => s.isLoadingMatches)
  const matchSearch = usePersonnelStore((s) => s.matchSearch)
  const setMatchSearch = usePersonnelStore((s) => s.setMatchSearch)
  const selectedEventId = usePersonnelStore((s) => s.selectedEventId)
  const setSelectedEventId = usePersonnelStore((s) => s.setSelectedEventId)
  const showUnassignedOnly = usePersonnelStore((s) => s.showUnassignedOnly)
  const setShowUnassignedOnly = usePersonnelStore(
    (s) => s.setShowUnassignedOnly
  )

  const assignRefereeAction = usePersonnelStore((s) => s.assignReferee)
  const unassignRefereeAction = usePersonnelStore((s) => s.unassignReferee)

  // Handlers
  const handleAssignReferee = async (matchId: string, refereeId: string) => {
    const referee = referees.find((r) => r.refereeId === refereeId)
    if (!referee) return

    const res = await assignRefereeAction(
      matchId,
      refereeId,
      referee.refereeName
    )
    if (res.success) {
      toast.success(
        t("personnel.assignments.assignSuccess", {
          defaultValue: "Referee assigned successfully!",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("personnel.assignments.assignFailed", {
            defaultValue: "Failed to assign referee",
          })
      )
    }
  }

  const handleUnassignReferee = async (matchId: string) => {
    const res = await unassignRefereeAction(matchId)
    if (res.success) {
      toast.success(
        t("personnel.assignments.unassignSuccess", {
          defaultValue: "Referee unassigned from match",
        })
      )
    } else {
      toast.error(
        res.error ||
          t("personnel.assignments.unassignFailed", {
            defaultValue: "Failed to unassign referee",
          })
      )
    }
  }

  // Filter matches on client side based on search query
  const filteredMatches = matches.filter((m) => {
    const query = matchSearch.toLowerCase()
    const refereeMatch = m.refereeName?.toLowerCase().includes(query) || false
    const team1Match = m.team1Id?.toLowerCase().includes(query) || false
    const team2Match = m.team2Id?.toLowerCase().includes(query) || false
    const roundMatch = m.round?.toLowerCase().includes(query) || false
    const eventMatch = m.event?.name?.toLowerCase().includes(query) || false
    return refereeMatch || team1Match || team2Match || roundMatch || eventMatch
  })

  return (
    <div className="space-y-6">
      {/* Filtering Panel */}
      <Card className="border border-gray-200 bg-white shadow-xs">
        <CardContent className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("personnel.assignments.searchPlaceholder")}
                className="bg-white pl-9"
                value={matchSearch}
                onChange={(e) => setMatchSearch(e.target.value)}
              />
            </div>
            {/* Event Select */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="bg-white">
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

          {/* Unassigned Toggle */}
          <div className="flex items-center gap-2 rounded-lg border border-emerald-100/50 bg-emerald-50/50 px-3 py-1.5">
            <Switch
              id="unassigned-only"
              checked={showUnassignedOnly}
              onCheckedChange={setShowUnassignedOnly}
            />
            <Label
              htmlFor="unassigned-only"
              className="cursor-pointer text-xs font-semibold text-emerald-800"
            >
              {t("personnel.assignments.unassignedOnly")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      {isLoadingMatches ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">
            {t("personnel.assignments.loading", {
              defaultValue: "Loading matches list...",
            })}
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <CardTitle className="mb-1 text-lg font-medium text-gray-900">
            {t("personnel.assignments.emptyTitle")}
          </CardTitle>
          <CardDescription className="max-w-xs">
            {t("personnel.assignments.emptyDesc")}
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isAssigned = !!match.refereeId
            return (
              <Card
                key={match.id}
                className={`overflow-hidden border shadow-xs transition-all duration-200 hover:shadow-sm ${
                  isAssigned
                    ? "border-gray-200 bg-white"
                    : "border-amber-200 bg-amber-50/10"
                }`}
              >
                <div className="flex flex-col items-stretch justify-between lg:flex-row lg:items-center">
                  {/* Left: Match metadata and fixtures */}
                  <div className="flex-1 space-y-4 p-5">
                    {/* Event & Round Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-sm bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                        {match.event?.name ||
                          t("personnel.assignments.eventLabel")}
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className="rounded-sm bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                        {match.round || t("personnel.assignments.roundLabel")}
                      </span>
                      {match.court?.name && (
                        <>
                          <span className="text-gray-500">|</span>
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <MapPin className="h-3 w-3 text-red-500" />
                            {match.court.name}
                          </span>
                        </>
                      )}
                      {match.time && (
                        <>
                          <span className="text-gray-500">|</span>
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <Clock className="h-3 w-3 text-blue-500" />
                            {match.time}
                          </span>
                        </>
                      )}
                      <span className="ml-auto lg:ml-0">
                        {match.status === "completed" ? (
                          <Badge className="border-none bg-emerald-100 px-2 py-0 text-[10px] font-medium text-emerald-800">
                            {t("list.statuses.completed", {
                              defaultValue: "Completed",
                            })}
                          </Badge>
                        ) : match.status === "in_progress" ? (
                          <Badge className="animate-pulse border-none bg-blue-100 px-2 py-0 text-[10px] font-medium text-blue-800">
                            {t("list.statuses.in_progress", {
                              defaultValue: "In Progress",
                            })}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-gray-300 px-2 py-0 text-[10px] font-medium text-gray-600"
                          >
                            {t("scheduling.status.scheduled", {
                              defaultValue: "Scheduled",
                            })}
                          </Badge>
                        )}
                      </span>
                    </div>

                    {/* Team vs Team layout */}
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-6 text-sm font-semibold text-gray-900 md:text-base">
                        <span className="min-w-[120px]">
                          {match.team1Id || "TBD Team 1"}
                        </span>
                        <span className="rounded-full border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-400">
                          {t("personnel.assignments.vs")}
                        </span>
                        <span className="min-w-[120px]">
                          {match.team2Id || "TBD Team 2"}
                        </span>
                      </div>

                      {/* Score if finished */}
                      {match.score && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 font-mono text-sm font-bold text-emerald-600">
                          {t("personnel.assignments.scoreLabel", {
                            score: match.score,
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Referee Status and Assignment controls */}
                  <div className="flex min-w-full items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-5 lg:min-w-[340px] lg:border-t-0 lg:border-l">
                    {/* Current Referee view */}
                    <div className="flex min-w-0 items-center gap-3">
                      {isAssigned ? (
                        <>
                          <Avatar className="h-9 w-9 border border-emerald-200">
                            <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800">
                              {match.refereeName
                                ?.substring(0, 2)
                                .toUpperCase() || "RF"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-gray-400">
                              {t("personnel.assignments.refereeLabel")}
                            </div>
                            <div className="truncate text-sm font-semibold text-gray-800">
                              {match.refereeName}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-amber-300 bg-amber-50 text-amber-600">
                            <Shield className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-400">
                              {t("personnel.assignments.refereeLabel")}
                            </div>
                            <div className="text-sm font-medium text-amber-600">
                              {t("personnel.assignments.unassigned")}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Assign Dropdown or Unassign Button */}
                    <div className="flex shrink-0 items-center gap-2">
                      {isAssigned ? (
                        <>
                          {/* Reassign dropdown select */}
                          <Select
                            onValueChange={(refId) =>
                              handleAssignReferee(match.id, refId)
                            }
                            value={match.refereeId}
                          >
                            <SelectTrigger className="h-9 w-[120px] bg-white text-xs">
                              <SelectValue
                                placeholder={t(
                                  "personnel.assignments.reassignPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {referees.map((ref) => (
                                <SelectItem
                                  key={ref.id}
                                  value={ref.refereeId}
                                  className="text-xs"
                                >
                                  {ref.refereeName} ({ref.workload || 0})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Unassign button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleUnassignReferee(match.id)}
                            title="Unassign Referee"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        /* Assign select box */
                        <Select
                          onValueChange={(refId) =>
                            handleAssignReferee(match.id, refId)
                          }
                          value=""
                        >
                          <SelectTrigger className="h-9 w-[140px] border-none bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700">
                            <UserPlus2 className="mr-1 h-3.5 w-3.5" />
                            <SelectValue
                              placeholder={t(
                                "personnel.assignments.assignPlaceholder"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {referees.length === 0 ? (
                              <SelectItem
                                value="none"
                                disabled
                                className="text-xs text-gray-400"
                              >
                                {t("personnel.assignments.noReferees", {
                                  defaultValue: "No referees enrolled",
                                })}
                              </SelectItem>
                            ) : (
                              referees.map((ref) => (
                                <SelectItem
                                  key={ref.id}
                                  value={ref.refereeId}
                                  className="text-xs"
                                >
                                  {ref.refereeName} ({ref.workload || 0})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
