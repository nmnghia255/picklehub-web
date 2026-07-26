"use client"

import { useQuery } from "@tanstack/react-query"

import { CoachClient } from "../api/coach-client"

export interface CourtBookingCourtSelection {
  bookingItemId?: string
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

export interface CourtBookingDateRange {
  startDate?: string
  endDate?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback
}

export function getBookingDateKey(value: string): string | null {
  const dateOnly = value.trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-").map(Number)
    const parsedDate = new Date(Date.UTC(year, month - 1, day))
    if (
      parsedDate.getUTCFullYear() === year &&
      parsedDate.getUTCMonth() === month - 1 &&
      parsedDate.getUTCDate() === day
    ) {
      return dateOnly
    }
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return [
    parsed.getUTCFullYear(),
    parsed.getUTCMonth() + 1,
    parsed.getUTCDate(),
  ]
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, "0")
    )
    .join("-")
}

export function getBookingDateTimeIso(
  dateKey: string,
  time: string
): string | null {
  const normalizedDateKey = getBookingDateKey(dateKey)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim())
  if (!normalizedDateKey || !timeMatch) return null

  const hours = Number(timeMatch[1])
  const minutes = Number(timeMatch[2])
  if (hours > 23 || minutes > 59) return null

  const [year, month, day] = normalizedDateKey.split("-").map(Number)
  const localDate = new Date(year, month - 1, day)
  localDate.setHours(hours, minutes, 0, 0)
  return localDate.toISOString()
}

function isBookingInDateRange(
  booking: CourtBookingSelection,
  dateRange?: CourtBookingDateRange
) {
  if (!dateRange?.startDate && !dateRange?.endDate) return true
  const bookingDate = getBookingDateKey(booking.date)
  if (!bookingDate) return false

  const startDate = dateRange.startDate
    ? getBookingDateKey(dateRange.startDate)
    : null
  const endDate = dateRange.endDate
    ? getBookingDateKey(dateRange.endDate)
    : null
  if (startDate && bookingDate < startDate) return false
  if (endDate && bookingDate > endDate) return false
  return true
}

function normalizeBookingItems(booking: Record<string, unknown>) {
  const seenSlotKeys = new Set<string>()
  const normalizeItems = (items: unknown[]) =>
    items.flatMap((item) => {
      if (!isRecord(item)) return []
      const court = isRecord(item.court) ? item.court : null
      const courtId = toStringValue(item.courtId, toStringValue(court?.id))
      const courtName = toStringValue(court?.name ?? item.courtName, courtId)
      const startTime = toStringValue(item.startTime)
      const endTime = toStringValue(item.endTime)

      const slotKey = `${courtId}|${startTime}|${endTime}`
      if (!courtId || seenSlotKeys.has(slotKey) || !startTime || !endTime) {
        return []
      }
      seenSlotKeys.add(slotKey)
      return [
        {
          bookingItemId: toStringValue(item.id) || undefined,
          courtId,
          courtName,
          startTime,
          endTime,
        },
      ]
    })

  if (Array.isArray(booking.bookingItems)) {
    return normalizeItems(booking.bookingItems)
  }

  if (Array.isArray(booking.items)) {
    return normalizeItems(booking.items)
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
  const getEarliestStartTime = (booking: CourtBookingSelection) =>
    booking.bookingItems.reduce(
      (earliest, item) =>
        !earliest || item.startTime < earliest ? item.startTime : earliest,
      ""
    )
  const leftTime = `${left.date} ${getEarliestStartTime(left)}`
  const rightTime = `${right.date} ${getEarliestStartTime(right)}`
  return leftTime.localeCompare(rightTime)
}

export function useCoachCourtBookings(options?: {
  enabled?: boolean
  dateRange?: CourtBookingDateRange
}) {
  const startDate = options?.dateRange?.startDate
    ? (getBookingDateKey(options.dateRange.startDate) ?? undefined)
    : undefined
  const endDate = options?.dateRange?.endDate
    ? (getBookingDateKey(options.dateRange.endDate) ?? undefined)
    : undefined

  const query = useQuery({
    queryKey: ["coach", "court-bookings", "confirmed", startDate, endDate],
    queryFn: async () => {
      const response = await CoachClient.listMyCourtBookings({
        status: "CONFIRMED",
        startDate,
        endDate,
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

  return {
    ...query,
    data: query.data?.filter((booking) =>
      isBookingInDateRange(booking, options?.dateRange)
    ),
  }
}
