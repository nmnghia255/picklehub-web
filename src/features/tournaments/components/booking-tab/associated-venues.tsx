"use client"

import { Building, ExternalLink, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useBookingStore } from "../../stores/use-booking-store"
import type { TournamentCenter } from "../../types/tournament-center"
import type { TournamentEvent } from "../../types/tournament-event"
import { AssociateCenterDialog } from "./associate-center-dialog"
import { EventSelectionDialog } from "./event-selection-dialog"

interface AssociatedVenuesProps {
  tournamentId: number
  centers: TournamentCenter[]
  events: TournamentEvent[]
  allSportCenters: SportCenter[]
  onAddCenter: (centerId: string) => Promise<void>
  onRemoveCenter: (centerId: string) => Promise<void>
  onOpenCenterDialog: () => Promise<void>
  isCenterDialogOpen: boolean
  setIsCenterDialogOpen: (open: boolean) => void
  /** Tournament start date (ISO YYYY-MM-DD) – restricts the date picker on the booking page */
  tournamentStartDate?: string | null
  /** Tournament end date (ISO YYYY-MM-DD) – restricts the date picker on the booking page */
  tournamentEndDate?: string | null
}

export function AssociatedVenues({
  tournamentId,
  centers,
  events,
  allSportCenters,
  onAddCenter,
  onRemoveCenter,
  onOpenCenterDialog,
  isCenterDialogOpen,
  setIsCenterDialogOpen,
  tournamentStartDate,
  tournamentEndDate,
}: AssociatedVenuesProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [associatedSearchQuery, setAssociatedSearchQuery] = useState("")

  const isEventDialogOpen = useBookingStore((s) => s.isEventDialogOpen)
  const setIsEventDialogOpen = useBookingStore((s) => s.setIsEventDialogOpen)
  const pendingCenterId = useBookingStore((s) => s.pendingCenterId)
  const setPendingCenterId = useBookingStore((s) => s.setPendingCenterId)

  // Filter already linked/associated centers in the main card list
  const filteredAssociatedCenters = centers.filter((center) => {
    const q = associatedSearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      center.name.toLowerCase().includes(q) ||
      (center.address && center.address.toLowerCase().includes(q))
    )
  })

  function handleBookClick(centerId: string) {
    setPendingCenterId(centerId)
    setIsEventDialogOpen(true)
  }

  function handleConfirmEventSelection(eventId: string | null) {
    if (!pendingCenterId) return
    setIsEventDialogOpen(false)
    // Build query params: eventId + optional tournament date range for calendar constraints
    const params = new URLSearchParams()
    if (eventId) params.set("eventId", eventId)
    if (tournamentStartDate) params.set("startDate", tournamentStartDate)
    if (tournamentEndDate) params.set("endDate", tournamentEndDate)
    const qs = params.toString()
    router.push(
      `/tournament-management/${tournamentId}/booking/${pendingCenterId}${qs ? `?${qs}` : ""}`
    )
  }

  return (
    <Card className="h-fit gap-0 border-gray-200 pb-2 shadow-sm lg:col-span-1 dark:border-zinc-800">
      <CardHeader className="border-b bg-gray-50/50 pb-0 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <CardTitle className="text-base font-bold text-gray-800 dark:text-zinc-100">
              {t("booking.venuesCard.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("booking.venuesCard.description")}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCenterDialog}
            className="h-8 border-emerald-600 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t("booking.addBtn")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {centers.length > 0 && (
          <div className="mb-4">
            <Input
              placeholder={t("booking.venuesCard.searchPlaceholder")}
              value={associatedSearchQuery}
              onChange={(e) => setAssociatedSearchQuery(e.target.value)}
              className="h-9 bg-white dark:bg-zinc-950"
            />
          </div>
        )}

        {centers.length === 0 ? (
          <div className="rounded-md bg-gray-50/30 py-8 text-center text-sm text-gray-500">
            <Building className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            {t("booking.venuesCard.noVenues")}
          </div>
        ) : filteredAssociatedCenters.length === 0 ? (
          <div className="rounded-md bg-gray-50/30 py-8 text-center text-sm text-gray-500 dark:bg-zinc-900/30 dark:text-zinc-400">
            {t("booking.venuesCard.noMatches")}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssociatedCenters.map((center) => (
              <div
                key={center.centerId}
                className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                    {center.name}
                  </div>
                  <div className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {center.address}
                  </div>
                  <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                    {t("booking.venuesCard.courtsCount", {
                      count: center.courts.length,
                    })}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/sport-center/${center.centerId}`)
                    }
                    className="h-8 border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    {t("booking.venuesCard.viewBtn", {
                      defaultValue: "Detail",
                    })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookClick(center.centerId)}
                    className="h-8 border-emerald-600 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                  >
                    {t("booking.venuesCard.bookBtn")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCenter(center.centerId)}
                    className="dark:hover:text-rose-350 h-8 w-8 shrink-0 rounded-full p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Associate Center Dialog */}
      <AssociateCenterDialog
        isOpen={isCenterDialogOpen}
        onOpenChange={setIsCenterDialogOpen}
        centers={centers}
        allSportCenters={allSportCenters}
        onAddCenter={onAddCenter}
      />

      {/* Event Selection Dialog */}
      <EventSelectionDialog
        events={events}
        onConfirm={handleConfirmEventSelection}
      />
    </Card>
  )
}
