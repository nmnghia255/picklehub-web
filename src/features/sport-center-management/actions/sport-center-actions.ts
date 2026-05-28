"use server"

import { SportCenterOwnerService } from "../api/sport-center-service"

export async function listOwnerSportCentersAction() {
  return SportCenterOwnerService.listOwnerSportCenters()
}
