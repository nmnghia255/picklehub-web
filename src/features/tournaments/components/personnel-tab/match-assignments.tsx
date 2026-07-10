"use client"

import { AlertCircle } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { getTournamentFixturesWithScheduleAction } from "../../actions/schedule-actions"
import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { TournamentSchedule } from "../../types/schedule"
import type { TournamentEvent } from "../../types/tournament-event"
import { AssignedMatchesTab } from "./assigned-matches-tab"
import { RefereeList } from "./referee-list"
import { RefereeProfileCard } from "./referee-profile-card"
import { UnassignedMatchesTab } from "./unassigned-matches-tab"

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
  const fetchMatches = usePersonnelStore((s) => s.fetchMatches)
  const unassignRefereeAction = usePersonnelStore((s) => s.unassignReferee)
  const bulkAssignRefereeAction = usePersonnelStore((s) => s.bulkAssignReferee)
  const tournamentId = usePersonnelStore((s) => s.tournamentId)

  // Local State
  const [selectedRefereeId, setSelectedRefereeId] = useState<string | null>(
    null
  )
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(
    new Set()
  )
  const [isAssigningBulk, setIsAssigningBulk] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("unassigned")
  const [scheduleMap, setScheduleMap] = useState<
    Record<string, TournamentSchedule>
  >({})

  // Auto-select first referee if none is selected
  useEffect(() => {
    if (!selectedRefereeId && referees.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRefereeId(referees[0].refereeId)
    }
  }, [referees, selectedRefereeId])

  // Fetch matches with showUnassignedOnly forced to false so we have all matches
  useEffect(() => {
    usePersonnelStore.setState({ showUnassignedOnly: false })
    void fetchMatches()
  }, [fetchMatches, selectedEventId])

  // Fetch tournament fixtures schedule
  useEffect(() => {
    let active = true
    if (!tournamentId) return

    const loadSchedule = async () => {
      try {
        const params: { eventId?: number } = {}
        if (selectedEventId && selectedEventId !== "all") {
          params.eventId = Number(selectedEventId)
        }

        const res = await getTournamentFixturesWithScheduleAction(
          Number(tournamentId),
          params
        )
        if (res.success && res.data) {
          let list: TournamentSchedule[] = []
          if (Array.isArray(res.data)) {
            list = res.data
          } else if (res.data && typeof res.data === "object") {
            const dataObj = res.data as Record<string, unknown>
            if ("fixtures" in dataObj && Array.isArray(dataObj.fixtures)) {
              list = dataObj.fixtures as TournamentSchedule[]
            } else if ("data" in dataObj && Array.isArray(dataObj.data)) {
              list = dataObj.data as TournamentSchedule[]
            }
          }

          const map: Record<string, TournamentSchedule> = {}
          list.forEach((item) => {
            map[String(item.id)] = item
          })
          if (active) {
            setScheduleMap(map)
          }
        }
      } catch (err) {
        console.error("Failed to load tournament schedule:", err)
      }
    }

    void loadSchedule()

    return () => {
      active = false
    }
  }, [tournamentId, selectedEventId])

  const selectedReferee = useMemo(() => {
    return referees.find((r) => r.refereeId === selectedRefereeId) || null
  }, [referees, selectedRefereeId])

  const getTeamLabel = useCallback(
    (matchId: string, teamId: string | null | undefined, isTeam1: boolean) => {
      if (!teamId) return "TBD"
      const sched = scheduleMap[String(matchId)]
      const team = sched ? (isTeam1 ? sched.team1 : sched.team2) : null
      if (team) {
        if (team.name) return team.name
        if (team.player1) {
          return team.player2
            ? `${team.player1.name} / ${team.player2.name}`
            : team.player1.name
        }
      }
      return `Team ${teamId}`
    },
    [scheduleMap]
  )

  const formatMatchTime = (
    startTimeStr: string | null | undefined,
    endTimeStr?: string | null | undefined,
    durationMinutes?: number | null
  ) => {
    if (!startTimeStr) return ""

    const cleanTime = (tStr: string) => {
      if (tStr.includes("T")) {
        try {
          const date = new Date(tStr)
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        } catch {
          return tStr
        }
      }
      const parts = tStr.split(":")
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
      }
      return tStr
    }

    const formattedStart = cleanTime(startTimeStr)

    if (endTimeStr) {
      const formattedEnd = cleanTime(endTimeStr)
      return `${formattedStart} - ${formattedEnd}`
    }

    const duration = durationMinutes || 45
    let startDate: Date | null = null
    if (startTimeStr.includes("T")) {
      try {
        startDate = new Date(startTimeStr)
      } catch {
        startDate = null
      }
    } else {
      try {
        const parts = startTimeStr.split(":")
        if (parts.length >= 2) {
          const hours = parseInt(parts[0], 10)
          const minutes = parseInt(parts[1], 10)
          startDate = new Date()
          startDate.setHours(hours, minutes, 0, 0)
        }
      } catch {
        startDate = null
      }
    }

    if (!startDate || isNaN(startDate.getTime())) {
      return formattedStart
    }

    const endDate = new Date(startDate.getTime() + duration * 60 * 1000)
    const formattedEnd = endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    return `${formattedStart} - ${formattedEnd}`
  }

  const renderTeamDetails = (
    matchId: string,
    teamId: string | null | undefined,
    isTeam1: boolean
  ) => {
    if (!teamId) {
      return <span className="text-sm font-semibold text-gray-400">TBD</span>
    }
    const sched = scheduleMap[String(matchId)]
    const team = sched ? (isTeam1 ? sched.team1 : sched.team2) : null

    if (!team) {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            Team {teamId}
          </span>
        </div>
      )
    }

    const player1Name = team.player1?.name
    const player2Name = team.player2?.name
    const seed = team.seed
    const rating = team.rating
    const p1Dupr = team.player1?.dupr
    const p2Dupr = team.player2?.dupr

    const displayName =
      team.name ||
      (player2Name ? `${player1Name} / ${player2Name}` : player1Name) ||
      `Team ${teamId}`

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="max-w-[180px] truncate text-sm font-semibold text-gray-900"
            title={displayName}
          >
            {displayName}
          </span>
          {seed ? (
            <Badge
              variant="outline"
              className="shrink-0 border-amber-200 bg-amber-50/50 px-1 py-0 text-[9px] font-bold text-amber-700"
            >
              #{seed}
            </Badge>
          ) : null}
        </div>

        {team.name && (player1Name || player2Name) && (
          <div
            className="truncate text-xs text-gray-500"
            title={
              player2Name ? `${player1Name} & ${player2Name}` : player1Name
            }
          >
            {player2Name ? `${player1Name} & ${player2Name}` : player1Name}
          </div>
        )}

        {rating || p1Dupr || p2Dupr ? (
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-400">
            {rating ? (
              <span>
                Rating:{" "}
                {typeof rating === "number" ? rating.toFixed(2) : rating}
              </span>
            ) : null}
            {(p1Dupr || p2Dupr) && (
              <span>
                DUPR: {p1Dupr || "-"}
                {p2Dupr ? ` / ${p2Dupr}` : ""}
              </span>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  // Handlers
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

  const toggleMatchSelection = (matchId: string) => {
    setSelectedMatchIds((prev) => {
      const next = new Set(prev)
      if (next.has(matchId)) {
        next.delete(matchId)
      } else {
        next.add(matchId)
      }
      return next
    })
  }

  const handleBulkAssign = async () => {
    if (!selectedReferee || selectedMatchIds.size === 0) return

    setIsAssigningBulk(true)
    const matchIdsArray = Array.from(selectedMatchIds)

    try {
      const res = await bulkAssignRefereeAction(
        matchIdsArray,
        selectedReferee.refereeId
      )
      if (res.success) {
        toast.success(
          t("personnel.assignments.bulkAssignSuccess", {
            defaultValue: `Successfully assigned ${matchIdsArray.length} matches to ${selectedReferee.refereeName}!`,
            count: matchIdsArray.length,
            name: selectedReferee.refereeName,
          })
        )
      } else {
        toast.error(
          res.error ||
            t("personnel.assignments.bulkAssignFailed", {
              defaultValue: "Failed to assign matches to referee.",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred during assignment.")
    } finally {
      setIsAssigningBulk(false)
      setSelectedMatchIds(new Set())
    }
  }

  // Filter unassigned matches based on search query and event selection
  const filteredUnassignedMatches = useMemo(() => {
    return matches
      .filter((m) => !m.refereeId || m.refereeId === "")
      .filter((m) => {
        const query = matchSearch.toLowerCase()
        const refereeMatch = m.refereeName
          ? String(m.refereeName).toLowerCase().includes(query)
          : false
        const team1Label = getTeamLabel(m.id, m.team1Id, true).toLowerCase()
        const team2Label = getTeamLabel(m.id, m.team2Id, false).toLowerCase()
        const team1Match =
          team1Label.includes(query) ||
          (m.team1Id ? String(m.team1Id).toLowerCase().includes(query) : false)
        const team2Match =
          team2Label.includes(query) ||
          (m.team2Id ? String(m.team2Id).toLowerCase().includes(query) : false)
        const roundMatch = m.round
          ? String(m.round).toLowerCase().includes(query)
          : false
        const eventMatch = m.event?.name
          ? String(m.event.name).toLowerCase().includes(query)
          : false

        const matchesSearch =
          refereeMatch || team1Match || team2Match || roundMatch || eventMatch
        const matchesEvent =
          selectedEventId === "all" || String(m.eventId) === selectedEventId
        return matchesSearch && matchesEvent
      })
  }, [matches, matchSearch, selectedEventId, scheduleMap, getTeamLabel])

  // Get current assignments for selected referee
  const refereeAssignments = useMemo(() => {
    if (!selectedRefereeId) return []
    return matches.filter((m) => m.refereeId === selectedRefereeId)
  }, [matches, selectedRefereeId])

  const allFilteredSelected = useMemo(() => {
    return (
      filteredUnassignedMatches.length > 0 &&
      filteredUnassignedMatches.every((m) => selectedMatchIds.has(m.id))
    )
  }, [filteredUnassignedMatches, selectedMatchIds])

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedMatchIds((prev) => {
        const next = new Set(prev)
        filteredUnassignedMatches.forEach((m) => next.delete(m.id))
        return next
      })
    } else {
      setSelectedMatchIds((prev) => {
        const next = new Set(prev)
        filteredUnassignedMatches.forEach((m) => next.add(m.id))
        return next
      })
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
      {/* Left Column: Referees List */}
      <RefereeList
        referees={referees}
        selectedRefereeId={selectedRefereeId}
        onSelectReferee={(id) => {
          setSelectedRefereeId(id)
          setSelectedMatchIds(new Set())
        }}
      />

      {/* Right Column: Assignment Workspace */}
      <div className="space-y-6 md:col-span-2">
        {!selectedReferee ? (
          <Card className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <CardTitle className="mb-1 text-lg font-medium text-gray-900">
              {t("personnel.assignments.selectRefereeTitle", {
                defaultValue: "No Referee Selected",
              })}
            </CardTitle>
            <CardDescription className="max-w-xs">
              {t("personnel.assignments.selectRefereePrompt", {
                defaultValue:
                  "Select a referee from the roster on the left to start managing match assignments.",
              })}
            </CardDescription>
          </Card>
        ) : (
          <>
            {/* Referee Profile Card */}
            <RefereeProfileCard referee={selectedReferee} />

            {/* Assignments Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 p-0">
                <TabsTrigger
                  value="unassigned"
                  className="py-2 text-xs font-semibold"
                >
                  {t("personnel.assignments.assignMatches", {
                    defaultValue: "Assign Matches",
                  })}
                </TabsTrigger>
                <TabsTrigger
                  value="assigned"
                  className="py-2 text-xs font-semibold"
                >
                  {t("personnel.assignments.currentAssignments", {
                    defaultValue: "Current Assignments ({{count}})",
                    count: refereeAssignments.length,
                  })}
                </TabsTrigger>
              </TabsList>

              {/* UNASSIGNED TAB */}
              <TabsContent
                value="unassigned"
                className="mt-4 space-y-4 focus:outline-hidden"
              >
                <UnassignedMatchesTab
                  events={events}
                  filteredUnassignedMatches={filteredUnassignedMatches}
                  selectedMatchIds={selectedMatchIds}
                  isAssigningBulk={isAssigningBulk}
                  matchSearch={matchSearch}
                  setMatchSearch={setMatchSearch}
                  selectedEventId={selectedEventId}
                  setSelectedEventId={setSelectedEventId}
                  allFilteredSelected={allFilteredSelected}
                  toggleSelectAll={toggleSelectAll}
                  toggleMatchSelection={toggleMatchSelection}
                  handleBulkAssign={handleBulkAssign}
                  isLoadingMatches={isLoadingMatches}
                  scheduleMap={scheduleMap}
                  formatMatchTime={formatMatchTime}
                  renderTeamDetails={renderTeamDetails}
                />
              </TabsContent>

              {/* CURRENT ASSIGNMENTS TAB */}
              <TabsContent
                value="assigned"
                className="mt-4 space-y-4 focus:outline-hidden"
              >
                <AssignedMatchesTab
                  refereeAssignments={refereeAssignments}
                  isLoadingMatches={isLoadingMatches}
                  handleUnassignReferee={handleUnassignReferee}
                  scheduleMap={scheduleMap}
                  formatMatchTime={formatMatchTime}
                  renderTeamDetails={renderTeamDetails}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
