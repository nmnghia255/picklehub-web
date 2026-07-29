"use server"

import { BookingService } from "@/features/sport-center/api/booking-service"

export interface DetailedBookingItem {
  id: string
  centerId?: string
  centerName?: string
  location?: string
  courtName: string
  startTime: string
  endTime: string
  price?: number
  status?: string
  items: Array<{
    id?: string
    courtId?: string
    courtName: string
    startTime: string
    endTime: string
    price?: number
  }>
}

export async function getSocialBookingsDetailsAction(
  bookingIds: string[]
): Promise<DetailedBookingItem[]> {
  if (!bookingIds || bookingIds.length === 0) return []

  const isUuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

  const validIds = bookingIds.filter(isUuid)
  if (validIds.length === 0) return []

  try {
    const results = await Promise.all(
      validIds.map(async (id) => {
        try {
          const b = await BookingService.getBookingById(id)
          const bData = b as unknown as Record<string, unknown>
          const rawItems =
            (bData?.items as Array<Record<string, unknown>>) ||
            (bData?.bookingItems as Array<Record<string, unknown>>) ||
            []

          const getStart = (obj: Record<string, unknown> | undefined) =>
            (obj?.startTime as string) ||
            (obj?.start_time as string) ||
            (obj?.startedAt as string) ||
            (obj?.startAt as string) ||
            (obj?.bookingDate as string) ||
            ""

          const getEnd = (obj: Record<string, unknown> | undefined) =>
            (obj?.endTime as string) ||
            (obj?.end_time as string) ||
            (obj?.finishedAt as string) ||
            (obj?.endAt as string) ||
            ""

          const formattedItems = rawItems.map((item) => {
            const courtObj = item.court as Record<string, unknown> | undefined
            return {
              id: (item.id as string) || (item.courtId as string),
              courtId: (item.courtId as string) || (courtObj?.id as string),
              courtName:
                (item.courtName as string) ||
                (courtObj?.name as string) ||
                "Sân",
              startTime: getStart(item) || getStart(bData),
              endTime: getEnd(item) || getEnd(bData),
              price: (item.price as number) || (item.amount as number) || 0,
            }
          })

          const courtNamesSummary = Array.from(
            new Set(formattedItems.map((i) => i.courtName).filter(Boolean))
          ).join(", ")

          const courtObj = bData.court as Record<string, unknown> | undefined

          return {
            id: (bData.id as string) || id,
            centerId:
              (bData.centerId as string) || (courtObj?.centerId as string),
            centerName:
              (bData.centerName as string) ||
              (courtObj?.centerName as string) ||
              "PickleHub Downtown",
            location:
              (bData.location as string) ||
              (bData.address as string) ||
              (courtObj?.address as string) ||
              "",
            courtName:
              courtNamesSummary || (bData.courtName as string) || "Sân",
            startTime: getStart(bData) || formattedItems[0]?.startTime || "",
            endTime: getEnd(bData) || formattedItems[0]?.endTime || "",
            price:
              (bData.totalAmount as number) || (bData.price as number) || 0,
            status: bData.status as string | undefined,
            items: formattedItems,
          } as DetailedBookingItem
        } catch (err) {
          console.error(`Failed to fetch booking ${id}:`, err)
          return null
        }
      })
    )
    return results.filter((item): item is DetailedBookingItem => item !== null)
  } catch (err) {
    console.error("Failed to fetch social bookings details:", err)
    return []
  }
}
