"use client"

import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Users,
  XCircle,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  checkinPlayerAction,
  getCheckinsAction,
} from "../actions/checkin-actions"
import {
  dispatchFixturesAction,
  getTournamentFixturesWithScheduleAction,
  syncFixturesAction,
} from "../actions/schedule-actions"
import { listTournamentRegistrationsAction } from "../actions/tournament-registration-actions"
import type { CheckIn } from "../types/checkin"
import type { Match, MatchTeam, MatchWarning } from "../types/match"
import type { RegistrationResponse } from "../types/registration"
import type { TournamentEvent } from "../types/tournament-event"

interface LiveControlCenterProps {
  tournamentId: number
  events: TournamentEvent[]
}

interface FixtureRawData {
  id: number | string
  eventId?: number | null
  event?: string | null
  round?: string | null
  team1?: { name: string } | string | null
  team2?: { name: string } | string | null
  winner?: string | number | null
  score?: string | null
  status?: string | null
  court?: string | null
  courtId?: string | null
  courtStatus?: string | null
  time?: string | null
  startTime?: string | null
  duration?: number | null
  priority?: string | null
  refereeId?: string | null
  refereeName?: string | null
  bookingId?: string | number | null
  bookingItemId?: string | null
  warnings?: MatchWarning[] | null
}

function getTeamName(team: MatchTeam | string | null | undefined): string {
  if (!team) return "TBD"
  if (typeof team === "object") return team.name || "TBD"
  return String(team)
}

export function LiveControlCenter({
  tournamentId,
  events,
}: LiveControlCenterProps) {
  const { t } = useTournamentTranslation()
  const [fixtures, setFixtures] = useState<Match[]>([])
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [checkins, setCheckins] = useState<CheckIn[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isDispatching, setIsDispatching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  // Control state
  const [dispatchEventId, setDispatchEventId] = useState<string>("")
  const activeDispatchEventId =
    dispatchEventId || (events.length > 0 ? events[0].id.toString() : "")

  // Checkin search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReg, setSelectedReg] = useState<RegistrationResponse | null>(
    null
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fixturesRes, regsRes, checkinsRes] = await Promise.all([
        getTournamentFixturesWithScheduleAction(tournamentId),
        listTournamentRegistrationsAction(tournamentId.toString(), "", ""),
        getCheckinsAction(tournamentId.toString()),
      ])

      if (fixturesRes.success && fixturesRes.data) {
        let rawFixtures: FixtureRawData[] = []
        if (Array.isArray(fixturesRes.data)) {
          rawFixtures = fixturesRes.data
        } else if (fixturesRes.data && typeof fixturesRes.data === "object") {
          if (
            "fixtures" in fixturesRes.data &&
            Array.isArray(
              (fixturesRes.data as Record<string, unknown>).fixtures
            )
          ) {
            rawFixtures = (fixturesRes.data as Record<string, unknown>)
              .fixtures as FixtureRawData[]
          } else if (
            "data" in fixturesRes.data &&
            Array.isArray((fixturesRes.data as Record<string, unknown>).data)
          ) {
            rawFixtures = (fixturesRes.data as Record<string, unknown>)
              .data as FixtureRawData[]
          }
        }

        const mappedMatches: Match[] = rawFixtures.map((f) => ({
          id: f.id,
          tournamentId: tournamentId,
          eventId: f.eventId || 0,
          event: f.event,
          round: f.round,
          team1:
            typeof f.team1 === "object" && f.team1
              ? f.team1
              : { name: (f.team1 as string) || "TBD" },
          team2:
            typeof f.team2 === "object" && f.team2
              ? f.team2
              : { name: (f.team2 as string) || "TBD" },
          winner: f.winner,
          score: f.score,
          status: f.status || "pending",
          court: f.court,
          courtId: f.courtId,
          courtStatus: f.courtStatus,
          time: f.time,
          startTime: f.startTime,
          duration: f.duration || 45,
          priority: f.priority || "medium",
          refereeId: f.refereeId,
          refereeName: f.refereeName,
          bookingId: f.bookingId ? Number(f.bookingId) : null,
          bookingItemId: f.bookingItemId,
          warnings: f.warnings || [],
        }))
        setFixtures(mappedMatches)
      }
      if (regsRes.success && regsRes.data) {
        setRegistrations(regsRes.data)
      }
      if (checkinsRes.success && checkinsRes.data) {
        setCheckins(checkinsRes.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load control center data")
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData()
    })
  }, [loadData])

  // Computed metrics
  const liveMatches = fixtures.filter(
    (f) => f.status === "in_progress" || f.status === "LIVE"
  )
  const upcomingMatches = fixtures.filter(
    (f) => f.status === "scheduled" || f.status === "ready"
  )

  // Active courts count
  const occupiedCourts = Array.from(
    new Set(liveMatches.map((f) => f.court).filter(Boolean))
  ).length
  const totalCourts =
    Array.from(new Set(fixtures.map((f) => f.court).filter(Boolean))).length ||
    4

  // Check-in count (Player 1 + Player 2)
  const checkedInCount = checkins.reduce((acc, curr) => {
    return (
      acc + (curr.player1CheckedIn ? 1 : 0) + (curr.player2CheckedIn ? 1 : 0)
    )
  }, 0)

  // Dispatch matches to match-service
  const handleDispatch = async () => {
    if (!activeDispatchEventId) {
      toast.error("Please select an event to dispatch")
      return
    }
    setIsDispatching(true)
    try {
      const res = await dispatchFixturesAction(
        tournamentId,
        activeDispatchEventId
      )
      if (res.success) {
        toast.success(
          "Matches dispatched to referee score sheets successfully!"
        )
        loadData()
      } else {
        toast.error(res.error || "Failed to dispatch matches")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during dispatch")
    } finally {
      setIsDispatching(false)
    }
  }

  // Sync matches from match-service
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await syncFixturesAction(tournamentId)
      if (res.success) {
        toast.success(
          "Tournament results and brackets synchronized from referee service!"
        )
        loadData()
      } else {
        toast.error(res.error || "Failed to sync tournament matches")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during match sync")
    } finally {
      setIsSyncing(false)
    }
  }

  // Check in player action
  const handleCheckInPlayer = async (
    regId: number | string,
    playerIndex: "player1" | "player2"
  ) => {
    setIsCheckingIn(true)
    try {
      const res = await checkinPlayerAction(
        tournamentId.toString(),
        regId.toString(),
        playerIndex
      )
      if (res.success) {
        toast.success(
          `Checked in ${playerIndex === "player1" ? "Player 1" : "Player 2"} successfully!`
        )
        // Update selected registration view
        loadData()
      } else {
        toast.error(res.error || "Failed to check-in player")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during check-in")
    } finally {
      setIsCheckingIn(false)
    }
  }

  // Search filter registrations
  const filteredRegs =
    searchQuery.trim() === ""
      ? []
      : registrations.filter((r) => {
          const query = searchQuery.toLowerCase()
          const p1Name = r.player?.name?.toLowerCase() || ""
          const p2Name = r.partner?.name?.toLowerCase() || ""
          const regIdStr = r.id.toString()
          return (
            p1Name.includes(query) ||
            p2Name.includes(query) ||
            regIdStr.includes(query)
          )
        })

  // Get matching checkin details for selected registration
  const selectedCheckin = selectedReg
    ? checkins.find((c) => String(c.registrationId) === String(selectedReg.id))
    : null

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-3">
          <Activity className="h-8 w-8 animate-pulse text-red-500" />
          <h1 className="text-3xl font-semibold text-gray-900">
            {t("liveControl.title", { defaultValue: "Live Control Center" })}
          </h1>
        </div>
        <p className="text-gray-600">
          {t("liveControl.subtitle", {
            defaultValue:
              "Monitor live matches, check-in players, and synchronize referee sheets.",
          })}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <Activity className="h-5 w-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                Live
              </Badge>
            </div>
            <div className="mb-1 text-3xl font-semibold text-gray-900">
              {liveMatches.length}
            </div>
            <div className="text-sm text-gray-600">Active Matches</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <Calendar className="h-5 w-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Upcoming
              </Badge>
            </div>
            <div className="mb-1 text-3xl font-semibold text-gray-900">
              {upcomingMatches.length}
            </div>
            <div className="text-sm text-gray-600">Scheduled Queue</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Courts
              </Badge>
            </div>
            <div className="mb-1 text-3xl font-semibold text-gray-900">
              {occupiedCourts}/{totalCourts}
            </div>
            <div className="text-sm text-gray-600">Courts in Use</div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <Users className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                Players
              </Badge>
            </div>
            <div className="mb-1 text-3xl font-semibold text-gray-900">
              {checkedInCount}
            </div>
            <div className="text-sm text-gray-600">Checked-in Players</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Board */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Operations & Dispatch Card */}
        <Card className="border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-base font-bold text-gray-800">
              Tournament Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Dispatch Section */}
            <div className="space-y-2.5">
              <Label className="font-semibold text-gray-700">
                Dispatch Matches
              </Label>
              <p className="text-xs text-gray-500">
                Send scheduled matches of the selected event to the match
                service for referee scoring.
              </p>
              <div className="flex gap-2">
                <Select
                  value={activeDispatchEventId}
                  onValueChange={setDispatchEventId}
                >
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Choose Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((evt) => (
                      <SelectItem key={evt.id} value={evt.id.toString()}>
                        {evt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleDispatch}
                  disabled={isDispatching || events.length === 0}
                  className="bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-700"
                >
                  {isDispatching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch
                    </>
                  )}
                </Button>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Sync Section */}
            <div className="space-y-2.5">
              <Label className="font-semibold text-gray-700">
                Sync Match Results
              </Label>
              <p className="text-xs text-gray-500">
                Fetch and update match scores, completed sets, and advancement
                status from referee scoring sheets.
              </p>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                className="w-full border-emerald-600 font-medium text-emerald-700 hover:bg-emerald-50"
              >
                {isSyncing ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Synchronize All Matches
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player Check-in System */}
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-base font-bold text-gray-800">
              Desk Player Check-In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search athlete name, partner name, or registration ID..."
                className="bg-white pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedReg(null) // Reset selection when searching
                }}
              />
            </div>

            {/* Query Results Dropdown */}
            {searchQuery && !selectedReg && (
              <div className="max-h-48 divide-y overflow-y-auto rounded-md border bg-white shadow-md">
                {filteredRegs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No matching registrations found
                  </div>
                ) : (
                  filteredRegs.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReg(r)
                        setSearchQuery("")
                      }}
                      className="flex cursor-pointer items-center justify-between p-3 text-sm hover:bg-emerald-50/30"
                    >
                      <div>
                        <span className="font-semibold text-gray-900">
                          {r.player?.name}
                        </span>
                        {r.partner && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            (with {r.partner.name})
                          </span>
                        )}
                        <div className="text-xs text-gray-400">
                          Event: {r.event}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ID: {r.id}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Check-In Details & Actions */}
            {selectedReg ? (
              <div className="space-y-4 rounded-lg border bg-gray-50/40 p-5">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedReg.player?.name}
                      {selectedReg.partner && ` & ${selectedReg.partner.name}`}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Registration ID: {selectedReg.id} • Event:{" "}
                      {selectedReg.event}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReg(null)}
                    className="text-xs text-gray-400"
                  >
                    Clear Selection
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Player 1 Checkin */}
                  <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      {selectedCheckin?.player1CheckedIn ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedReg.player?.name} (Player 1)
                        </span>
                        {selectedCheckin &&
                          selectedCheckin.player1CheckedInAt && (
                            <span className="block text-[10px] text-gray-400">
                              Checked in:{" "}
                              {new Date(
                                selectedCheckin.player1CheckedInAt
                              ).toLocaleTimeString()}
                            </span>
                          )}
                      </div>
                    </div>
                    {!selectedCheckin?.player1CheckedIn && (
                      <Button
                        size="sm"
                        disabled={isCheckingIn}
                        onClick={() =>
                          handleCheckInPlayer(selectedReg.id, "player1")
                        }
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Check In
                      </Button>
                    )}
                  </div>

                  {/* Player 2 Checkin (if doubles event) */}
                  {selectedReg.partner && (
                    <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {selectedCheckin?.player2CheckedIn ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReg.partner.name} (Player 2)
                          </span>
                          {selectedCheckin &&
                            selectedCheckin.player2CheckedInAt && (
                              <span className="block text-[10px] text-gray-400">
                                Checked in:{" "}
                                {new Date(
                                  selectedCheckin.player2CheckedInAt
                                ).toLocaleTimeString()}
                              </span>
                            )}
                        </div>
                      </div>
                      {!selectedCheckin?.player2CheckedIn && (
                        <Button
                          size="sm"
                          disabled={isCheckingIn}
                          onClick={() =>
                            handleCheckInPlayer(selectedReg.id, "player2")
                          }
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Check In
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-gray-50/20 p-8 text-center text-sm text-gray-400">
                <Users className="mx-auto mb-2 h-8 w-8 animate-pulse text-gray-300" />
                Select a player registration above to manage check-in.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Matches Overview Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Matches List */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              Active Live Matches ({liveMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-72">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : liveMatches.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No live matches currently in progress
                </div>
              ) : (
                <div className="space-y-4">
                  {liveMatches.map((match) => (
                    <div
                      key={match.id}
                      className="rounded-lg border border-yellow-200 bg-yellow-50/60 p-4 shadow-xs"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <Badge className="mb-2 bg-yellow-600 text-white">
                            {match.court || "No Court"}
                          </Badge>
                          <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                            {match.event} • {match.round}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-700">
                            {match.score || "0 - 0"}
                          </div>
                          {match.refereeName && (
                            <div className="text-[10px] font-medium text-gray-500">
                              Ref: {match.refereeName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {getTeamName(match.team1)}{" "}
                        <span className="px-1 text-gray-400">vs</span>{" "}
                        {getTeamName(match.team2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Scheduled Matches Queue */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <Clock className="h-4 w-4 text-blue-500" />
              Scheduled Queue ({upcomingMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-72">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : upcomingMatches.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No upcoming scheduled matches
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-start gap-3 rounded-lg border bg-gray-50/50 p-3 text-sm shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-[10px] font-medium text-blue-700"
                          >
                            {match.court || "No Court"}
                          </Badge>
                          <span className="flex items-center gap-0.5 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {match.startTime || "TBD"}
                          </span>
                        </div>
                        <div className="mb-1 truncate font-semibold text-gray-900">
                          {getTeamName(match.team1)} vs{" "}
                          {getTeamName(match.team2)}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {match.event} • {match.round}
                        </div>
                      </div>
                      <Badge className="self-center border-none bg-blue-100 font-medium text-blue-800 capitalize">
                        {match.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
