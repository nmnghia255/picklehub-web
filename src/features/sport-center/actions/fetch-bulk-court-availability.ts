"use server"

import { CourtService } from "@/features/sport-center/api/court-service"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"

function formatBookingDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  return formatter.format(d)
}

export async function fetchBulkCourtAvailabilityAction(
  centerId: string,
  date: Date | string
): Promise<BulkCourtAvailability> {
  return CourtService.getBulkCourtAvailability(
    centerId,
    formatBookingDate(date)
  )
}
