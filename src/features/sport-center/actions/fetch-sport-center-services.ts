"use server"

import { getSportCenterServices } from "@/features/sport-center/api/sport-center-user-service"
import type { Service } from "@/features/sport-center/types/service"

export async function fetchSportCenterServicesAction(
  centerId: string
): Promise<Service[]> {
  return getSportCenterServices(centerId)
}
