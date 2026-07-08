"use client"

import { Activity } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  checkinPlayerAction,
  getCheckinsAction,
} from "../../actions/checkin-actions"
import {
  dispatchFixturesAction,
  getTournamentFixturesWithScheduleAction,
  syncFixturesAction,
} from "../../actions/schedule-actions"
import { listTournamentRegistrationsAction } from "../../actions/tournament-registration-actions"
import type { CheckIn } from "../../types/checkin"
import type { Match, MatchWarning } from "../../types/match"
import type { RegistrationResponse } from "../../types/registration"
import type { TournamentEvent } from "../../types/tournament-event"
import { LiveMatchesCard } from "./live-matches-card"
import { MetricsCards } from "./metrics-cards"
import { OperationsCard } from "./operations-card"
import { PlayerCheckinCard } from "./player-checkin-card"
import { ScheduledQueueCard } from "./scheduled-queue-card"

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
      toast.error(
        t("liveControl.toasts.loadFailed", {
          defaultValue: "Failed to load control center data",
        })
      )
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId, t])

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
    const activeDispatchEventId =
      dispatchEventId || (events.length > 0 ? events[0].id.toString() : "")
    if (!activeDispatchEventId) {
      toast.error(
        t("liveControl.toasts.selectEventDispatch", {
          defaultValue: "Please select an event to dispatch",
        })
      )
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
          t("liveControl.toasts.dispatchSuccess", {
            defaultValue:
              "Matches dispatched to referee score sheets successfully!",
          })
        )
        loadData()
      } else {
        toast.error(
          res.error ||
            t("liveControl.toasts.dispatchFailed", {
              defaultValue: "Failed to dispatch matches",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("liveControl.toasts.dispatchError", {
          defaultValue: "An error occurred during dispatch",
        })
      )
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
          t("liveControl.toasts.syncSuccess", {
            defaultValue:
              "Tournament results and brackets synchronized from referee service!",
          })
        )
        loadData()
      } else {
        toast.error(
          res.error ||
            t("liveControl.toasts.syncFailed", {
              defaultValue: "Failed to sync tournament matches",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("liveControl.toasts.syncError", {
          defaultValue: "An error occurred during match sync",
        })
      )
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
        const playerLabel = playerIndex === "player1" ? "Player 1" : "Player 2"
        toast.success(
          t("liveControl.toasts.checkinSuccess", {
            player: playerLabel,
            defaultValue: `Checked in ${playerLabel} successfully!`,
          })
        )
        loadData()
      } else {
        toast.error(
          res.error ||
            t("liveControl.toasts.checkinFailed", {
              defaultValue: "Failed to check-in player",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("liveControl.toasts.checkinError", {
          defaultValue: "An error occurred during check-in",
        })
      )
    } finally {
      setIsCheckingIn(false)
    }
  }

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

      {/* Summary Metrics Cards row */}
      <MetricsCards
        liveCount={liveMatches.length}
        upcomingCount={upcomingMatches.length}
        occupiedCourts={occupiedCourts}
        totalCourts={totalCourts}
        checkedInCount={checkedInCount}
      />

      {/* Main Operations Board */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Operations & Dispatch Card */}
        <OperationsCard
          events={events}
          dispatchEventId={dispatchEventId}
          setDispatchEventId={setDispatchEventId}
          onDispatch={handleDispatch}
          onSync={handleSync}
          isDispatching={isDispatching}
          isSyncing={isSyncing}
        />

        {/* Player Check-in System */}
        <PlayerCheckinCard
          registrations={registrations}
          checkins={checkins}
          onCheckInPlayer={handleCheckInPlayer}
          isCheckingIn={isCheckingIn}
        />
      </div>

      {/* Matches Overview Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Matches List */}
        <LiveMatchesCard
          liveMatches={liveMatches}
          isLoading={isLoading}
          tournamentId={tournamentId}
        />

        {/* Scheduled Matches Queue */}
        <ScheduledQueueCard
          upcomingMatches={upcomingMatches}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
