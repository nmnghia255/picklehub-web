"use server"

import { getSportCenterById } from "@/features/sport-center/api/sport-center-service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export async function fetchSportCenterByIdAction(
  centerId: string
): Promise<SportCenter> {
  return getSportCenterById(centerId)
}
