"use client"

import { Grid, Loader2 } from "lucide-react"
import { useEffect } from "react"

import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useTournamentDashboardStore } from "../../stores/tournament-dashboard-store"
import { useGroupStageStore } from "../../stores/use-group-stage-store"
import type { TournamentEvent } from "../../types/tournament-event"
import { GroupConfigCard } from "./group-config-card"
import { GroupDrawCard } from "./group-draw-card"
import { GroupProgressionCard } from "./group-progression-card"
import { GroupStageMatches } from "./group-stage-matches"
import { GroupStandingsGrid } from "./group-standings-grid"

interface GroupManagementProps {
  tournamentId: number
  events: TournamentEvent[]
  isHost: boolean
  eventId?: number
  hideEventSelect?: boolean
  isEditable: boolean
}

export function GroupManagement({
  tournamentId,
  events = [],
  isHost,
  eventId,
  hideEventSelect = false,
  isEditable,
}: GroupManagementProps) {
  const { t } = useTournamentTranslation()

  const selectedEventId = useGroupStageStore((s) => s.selectedEventId)
  const isLoadingData = useGroupStageStore((s) => s.isLoadingData)

  const setTournamentId = useGroupStageStore((s) => s.setTournamentId)
  const setSelectedEventId = useGroupStageStore((s) => s.setSelectedEventId)
  const fetchData = useGroupStageStore((s) => s.fetchData)
  const reset = useGroupStageStore((s) => s.reset)

  // Sync tournament ID and events with stores
  useEffect(() => {
    setTournamentId(tournamentId)
    if (events.length > 0) {
      const currentEvents = useTournamentDashboardStore.getState().events
      if (!currentEvents || currentEvents.length === 0) {
        useTournamentDashboardStore.setState({ events })
      }
    }
  }, [tournamentId, events, setTournamentId])

  // Set default event selection
  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId.toString())
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id.toString())
    }
  }, [eventId, events, selectedEventId, setSelectedEventId])

  // Fetch data on event change
  useEffect(() => {
    if (selectedEventId) {
      void fetchData(t)
    }
  }, [selectedEventId, fetchData, t])

  // Reset store state on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  if (events.length === 0) {
    return (
      <div className={hideEventSelect ? "p-6 md:p-8" : "p-8"}>
        <div className="mx-auto max-w-7xl">
          {!hideEventSelect && (
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("groupStage.title", { defaultValue: "Group Stage" })}
              </h1>
              <p className="text-gray-600">
                {t("groupStage.subtitle", {
                  defaultValue:
                    "Manage tournament group stage divisions, standings, and matches.",
                })}
              </p>
            </div>
          )}
          <Card className="flex flex-col items-center justify-center border-gray-200 bg-white p-12 text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4">
              <Grid className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-950">
              {t("seeding.noEventsCreatedYet")}
            </h3>
            <p className="max-w-md text-sm text-gray-600">
              {t("seeding.noEventsDescription")}
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={hideEventSelect ? "p-6 md:p-8" : "p-8"}>
      <div className="mx-auto max-w-7xl space-y-8">
        {!hideEventSelect && (
          <>
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                  {t("groupStage.title", { defaultValue: "Group Stage" })}
                </h1>
                <p className="text-gray-600">
                  {t("groupStage.subtitle", {
                    defaultValue:
                      "Manage tournament group stage divisions, standings, and matches.",
                  })}
                </p>
              </div>
            </div>

            {/* Dropdown Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                {t("seeding.selectEvent")}
              </label>
              <div className="w-full sm:w-70">
                <Select
                  value={selectedEventId}
                  onValueChange={setSelectedEventId}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={t("seeding.chooseEvent")} />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {isLoadingData ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {isEditable && (
              <div className="grid gap-6 md:grid-cols-3">
                <GroupConfigCard events={events} />
                <GroupDrawCard />
                <GroupProgressionCard />
              </div>
            )}

            <GroupStandingsGrid isEditable={isEditable} />

            {isHost && selectedEventId && (
              <GroupStageMatches
                tournamentId={tournamentId}
                eventId={Number(selectedEventId)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
