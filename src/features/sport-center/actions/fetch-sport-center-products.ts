"use server"

import { getSportCenterProducts } from "@/features/sport-center/api/sport-center-service"
import type { Product } from "@/features/sport-center/types/product"

export async function fetchSportCenterProductsAction(
  centerId: string
): Promise<Product[]> {
  return getSportCenterProducts(centerId)
}
