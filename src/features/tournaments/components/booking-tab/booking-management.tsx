"use client"

import { Loader2, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  addTournamentCenterAction,
  cancelBookingAction,
  getTournamentBookingsAction,
  getTournamentCentersAction,
  listAllSportCentersAction,
  removeTournamentCenterAction,
  syncBookingStatusAction,
} from "../../actions/booking-actions"
import { getTournamentEventsAction } from "../../actions/tournament-event-actions"
import type { TournamentBooking } from "../../types/booking"
import type { TournamentCenter } from "../../types/tournament-center"
import type { TournamentEvent } from "../../types/tournament-event"
import { AssociatedVenues } from "./associated-venues"
import { BookingsHistory } from "./bookings-history"

export function BookingManagement({
  tournamentId,
  tournamentStartDate,
  tournamentEndDate,
}: {
  tournamentId: number
  tournamentStartDate?: string | null
  tournamentEndDate?: string | null
}) {
  const { t } = useTournamentTranslation()
  const [centers, setCenters] = useState<TournamentCenter[]>([])
  const [bookings, setBookings] = useState<TournamentBooking[]>([])
  const [events, setEvents] = useState<TournamentEvent[]>([])
  const [allSportCenters, setAllSportCenters] = useState<SportCenter[]>([])

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Dialog Opens
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [centersRes, bookingsRes, eventsRes] = await Promise.all([
        getTournamentCentersAction(tournamentId.toString()),
        getTournamentBookingsAction(tournamentId),
        getTournamentEventsAction(tournamentId.toString()),
      ])

      if (centersRes.success && centersRes.data) {
        const rawCenters = centersRes.data
        const centersArray = Array.isArray(rawCenters)
          ? rawCenters
          : rawCenters &&
              typeof rawCenters === "object" &&
              "centers" in rawCenters &&
              Array.isArray((rawCenters as Record<string, unknown>).centers)
            ? ((rawCenters as Record<string, unknown>)
                .centers as TournamentCenter[])
            : rawCenters &&
                typeof rawCenters === "object" &&
                "data" in rawCenters &&
                Array.isArray((rawCenters as Record<string, unknown>).data)
              ? ((rawCenters as Record<string, unknown>)
                  .data as TournamentCenter[])
              : []
        setCenters(centersArray)
      } else {
        toast.error(centersRes.error || t("booking.toasts.loadCentersFailed"))
      }

      if (bookingsRes.success && bookingsRes.data) {
        const rawBookings = bookingsRes.data
        const bookingsArray = Array.isArray(rawBookings)
          ? rawBookings
          : rawBookings &&
              typeof rawBookings === "object" &&
              "bookings" in rawBookings &&
              Array.isArray((rawBookings as Record<string, unknown>).bookings)
            ? ((rawBookings as Record<string, unknown>)
                .bookings as TournamentBooking[])
            : rawBookings &&
                typeof rawBookings === "object" &&
                "data" in rawBookings &&
                Array.isArray((rawBookings as Record<string, unknown>).data)
              ? ((rawBookings as Record<string, unknown>)
                  .data as TournamentBooking[])
              : []
        setBookings(bookingsArray)
      } else {
        toast.error(bookingsRes.error || t("booking.toasts.loadBookingsFailed"))
      }

      if (eventsRes.success && eventsRes.data) {
        const rawEvents = eventsRes.data
        const eventsArray = Array.isArray(rawEvents) ? rawEvents : []
        setEvents(eventsArray)
      }
    } catch (error) {
      console.error(error)
      toast.error(t("booking.toasts.loadDataFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  // Fetch all sport centers for association
  const handleOpenCenterDialog = async () => {
    setIsCenterDialogOpen(true)
    try {
      const res = await listAllSportCentersAction()
      if (res.success && res.data) {
        const rawData = res.data
        const dataArray = Array.isArray(rawData)
          ? rawData
          : rawData &&
              typeof rawData === "object" &&
              "data" in rawData &&
              Array.isArray((rawData as Record<string, unknown>).data)
            ? ((rawData as Record<string, unknown>).data as SportCenter[])
            : []
        setAllSportCenters(dataArray)
      } else {
        toast.error(res.error || t("booking.toasts.loadAvailableFailed"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("booking.toasts.loadAvailableFailed"))
    }
  }

  // Associate Center Callback
  const handleAddCenter = async (centerId: string) => {
    try {
      const res = await addTournamentCenterAction(tournamentId.toString(), [
        centerId,
      ])
      if (res.success) {
        toast.success(t("booking.toasts.centerAdded"))
        loadData()
      } else {
        toast.error(res.error || t("booking.toasts.associateCenterFailed"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("booking.toasts.associateCenterFailed"))
    }
  }

  // Remove Center Callback
  const handleRemoveCenter = async (centerId: string) => {
    try {
      const res = await removeTournamentCenterAction(
        tournamentId.toString(),
        centerId
      )
      if (res.success) {
        toast.success(t("booking.toasts.centerRemoved"))
        loadData()
      } else {
        toast.error(res.error || t("booking.toasts.removeCenterFailed"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("booking.toasts.removeCenterFailed"))
    }
  }

  // Sync Bookings Callback
  const handleSyncBookings = async () => {
    setIsSyncing(true)
    try {
      const res = await syncBookingStatusAction(tournamentId)
      if (res.success) {
        toast.success(t("booking.toasts.syncSuccess"))
        loadData()
      } else {
        toast.error(res.error || t("booking.toasts.syncFailed"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("booking.toasts.syncFailed"))
    } finally {
      setIsSyncing(false)
    }
  }

  // Cancel Booking Callback
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await cancelBookingAction(tournamentId, bookingId)
      if (res.success) {
        toast.success(t("booking.toasts.cancelSuccess"))
        loadData()
      } else {
        toast.error(res.error || t("booking.toasts.cancelFailed"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("booking.toasts.cancelFailed"))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("booking.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t("booking.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleSyncBookings}
            disabled={isSyncing}
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {t("booking.syncBtn")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Associated Venues Card */}
        <AssociatedVenues
          tournamentId={tournamentId}
          centers={centers}
          events={events}
          allSportCenters={allSportCenters}
          onAddCenter={handleAddCenter}
          onRemoveCenter={handleRemoveCenter}
          onOpenCenterDialog={handleOpenCenterDialog}
          isCenterDialogOpen={isCenterDialogOpen}
          setIsCenterDialogOpen={setIsCenterDialogOpen}
          tournamentStartDate={tournamentStartDate}
          tournamentEndDate={tournamentEndDate}
        />

        {/* Bookings List Card */}
        <BookingsHistory
          bookings={bookings}
          centers={centers}
          onCancelBooking={handleCancelBooking}
        />
      </div>
    </div>
  )
}
