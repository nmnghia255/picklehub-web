"use client"

import { useQuery } from "@tanstack/react-query"

import { CoachClient } from "../api/coach-client"

export interface CourtBookingCourtSelection {
  courtId: string
  courtName: string
  startTime: string
  endTime: string
}

export interface CourtBookingSelection {
  id: string
  centerName: string
  centerAddress: string | null
  date: string
  status: string
  bookingItems: CourtBookingCourtSelection[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback
}

function normalizeBookingItems(booking: Record<string, unknown>) {
  if (Array.isArray(booking.bookingItems)) {
    return booking.bookingItems.flatMap((item) => {
      if (!isRecord(item)) return []
      const court = isRecord(item.court) ? item.court : null
      const courtId = toStringValue(item.courtId, toStringValue(court?.id))
      const courtName = toStringValue(court?.name ?? item.courtName, courtId)
      const startTime = toStringValue(item.startTime)
      const endTime = toStringValue(item.endTime)

      if (!courtId || !startTime || !endTime) return []

      return [
        {
          courtId,
          courtName,
          startTime,
          endTime,
        },
      ]
    })
  }

  if (Array.isArray(booking.items)) {
    return booking.items.flatMap((item) => {
      if (!isRecord(item)) return []
      const courtId = toStringValue(item.courtId)
      const courtName = toStringValue(item.courtName, courtId)
      const startTime = toStringValue(item.startTime)
      const endTime = toStringValue(item.endTime)

      if (!courtId || !startTime || !endTime) return []

      return [
        {
          courtId,
          courtName,
          startTime,
          endTime,
        },
      ]
    })
  }

  return []
}

function normalizeCourtBookingSelection(
  booking: unknown
): CourtBookingSelection | null {
  if (!isRecord(booking)) return null

  const bookingItems = normalizeBookingItems(booking)
  if (bookingItems.length === 0) return null

  const center = isRecord(booking.center) ? booking.center : null

  return {
    id: toStringValue(booking.id),
    centerName: toStringValue(
      center?.name,
      toStringValue(booking.centerName, "")
    ),
    centerAddress:
      toStringValue(
        center?.address,
        toStringValue(booking.centerAddress, "")
      ) || null,
    date: toStringValue(booking.date),
    status: toStringValue(booking.status),
    bookingItems,
  }
}

function compareBookingSelections(
  left: CourtBookingSelection,
  right: CourtBookingSelection
) {
  const leftTime = `${left.date} ${left.bookingItems[0]?.startTime ?? ""}`
  const rightTime = `${right.date} ${right.bookingItems[0]?.startTime ?? ""}`
  return leftTime.localeCompare(rightTime)
}

export function useCoachCourtBookings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["coach", "court-bookings", "confirmed"],
    queryFn: async () => {
      const response = await CoachClient.listMyCourtBookings({
        status: "CONFIRMED",
        limit: 200,
        offset: 0,
      })

      const rawBookings = Array.isArray(response.data) ? response.data : []
      const bookings = rawBookings
        .map((booking) => normalizeCourtBookingSelection(booking))
        .filter((booking): booking is CourtBookingSelection => booking !== null)
        .filter((booking) => booking.status === "CONFIRMED")
        .sort(compareBookingSelections)

      return bookings
    },
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
