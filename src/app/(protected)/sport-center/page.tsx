import { PageContainer } from "@/components/page-container"
import {
  getMyFavoriteSportCenters,
  listSportCenters,
} from "@/features/sport-center/api/sport-center-user-service"
import { SportCenterBrowser } from "@/features/sport-center/components/sport-center-listing/sport-center-browser"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export default async function SportCenterPage() {
  let sportCenters: SportCenter[] = []
  let favoriteCenterIds = new Set<string>()

  const [sportCentersResult, favoriteCentersResult] = await Promise.allSettled([
    listSportCenters(),
    getMyFavoriteSportCenters(),
  ])

  if (sportCentersResult.status === "fulfilled") {
    sportCenters = sportCentersResult.value
  } else {
    console.warn("Failed to fetch sport centers, showing empty state.")
  }

  if (favoriteCentersResult.status === "fulfilled") {
    favoriteCenterIds = new Set(
      favoriteCentersResult.value.map((favorite) => favorite.centerId)
    )
  } else {
    console.warn(
      "Failed to fetch favorite sport centers, continuing without it."
    )
  }

  const hydratedSportCenters = sportCenters.map((sportCenter) => ({
    ...sportCenter,
    isFavourite:
      favoriteCenterIds.has(sportCenter.id) || sportCenter.isFavourite,
  }))

  return (
    <PageContainer variant="wide">
      <SportCenterBrowser sportCenters={hydratedSportCenters} />
    </PageContainer>
  )
}
