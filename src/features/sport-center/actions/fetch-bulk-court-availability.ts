"use server"

import { getBulkCourtAvailability } from "@/features/sport-center/api/sport-center-user-service"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"

function formatBookingDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export async function fetchBulkCourtAvailabilityAction(
  centerId: string,
  date: Date
): Promise<BulkCourtAvailability> {
  return getBulkCourtAvailability(centerId, formatBookingDate(date))
}
