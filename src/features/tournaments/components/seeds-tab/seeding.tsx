"use client"

import { Lock, Shuffle } from "lucide-react"
import { useEffect } from "react"

import { Card } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentStatus } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { SeedingHeader } from "./seeding-header"
import { SeedingInstructions } from "./seeding-instructions"
import { SeedingSelector } from "./seeding-selector"
import { SeedingTable } from "./seeding-table"
import { useSeedingStore } from "./use-seeding-store"

interface SeedingProps {
  tournamentId: number
  tournamentStatus: TournamentStatus
  events?: TournamentEvent[]
  isHost?: boolean
  isEditable: boolean
}

export function Seeding({
  tournamentId,
  tournamentStatus,
  events = [],
  isEditable,
}: SeedingProps) {
  const { t } = useTournamentTranslation()

  const selectedEventId = useSeedingStore((s) => s.selectedEventId)
  const seedsList = useSeedingStore((s) => s.seedsList)

  const setTournamentId = useSeedingStore((s) => s.setTournamentId)
  const setSelectedEventId = useSeedingStore((s) => s.setSelectedEventId)
  const fetchSeeding = useSeedingStore((s) => s.fetchSeeding)
  const reset = useSeedingStore((s) => s.reset)

  // Sync tournament ID with the store
  useEffect(() => {
    setTournamentId(tournamentId)
  }, [tournamentId, setTournamentId])

  // Set default event selection
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id.toString())
    }
  }, [events, selectedEventId, setSelectedEventId])

  // Fetch seeding data when event selection changes
  useEffect(() => {
    if (selectedEventId) {
      void fetchSeeding(Number(selectedEventId), t)
    }
  }, [selectedEventId, fetchSeeding, t])

  // Reset store state on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const isLocked =
    seedsList.length > 0 && seedsList.some((s) => s.status === "locked")

  // For seeding modifications, we lock editing rules
  const hostVal = true // matching legacy behavior in seeding.tsx
  const canManageSeeding =
    isEditable && tournamentStatus === "closed_registration"

  const selectedEvent = events.find((e) => e.id.toString() === selectedEventId)

  if (events.length === 0) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {t("seeding.title")}
            </h1>
            <p className="text-gray-600">{t("seeding.subtitle")}</p>
          </div>
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4">
              <Shuffle className="h-8 w-8 text-emerald-600" />
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
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        {canManageSeeding && <SeedingHeader isLocked={isLocked} />}

        {/* Dropdown Selector */}
        <div className="mb-8">
          <SeedingSelector events={events} />
        </div>

        {/* Status Validation Warning Banner */}
        {canManageSeeding && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h4 className="text-sm font-semibold text-amber-950">
                {t("seeding.statusNoticeTitle")}
              </h4>
              <p className="mt-1 text-sm text-amber-900">
                {t("seeding.statusNoticeDescription", {
                  status: t(`list.statuses.${tournamentStatus}`, {
                    defaultValue: tournamentStatus,
                  }),
                })}
              </p>
            </div>
          </div>
        )}

        {/* Seeding Table */}
        <SeedingTable
          selectedEvent={selectedEvent}
          canManageSeeding={canManageSeeding}
          isLocked={isLocked}
        />

        {/* Instructions */}
        <SeedingInstructions />
      </div>
    </div>
  )
}
