import {
  addFavoriteSportCenter,
  removeFavoriteSportCenter,
} from "@/features/sport-center/api/sport-center-service"
import enSportCenter from "@/i18n/locales/en/sport-center.json"
import viSportCenter from "@/i18n/locales/vi/sport-center.json"

export interface ToggleFavoriteSportCenterState {
  isFavourite: boolean
  message?: string
  error?: string
}

function getSportCenterLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viSportCenter : enSportCenter
}

export async function toggleFavoriteSportCenterAction(
  _state: ToggleFavoriteSportCenterState,
  formData: FormData
): Promise<ToggleFavoriteSportCenterState> {
  const sportCenter = getSportCenterLocale()
  const centerId = String(formData.get("centerId") ?? "").trim()
  const isFavourite = formData.get("isFavourite") === "true"

  if (!centerId) {
    return {
      isFavourite,
      error: sportCenter.detail.favoriteMissing,
    }
  }

  try {
    if (isFavourite) {
      await removeFavoriteSportCenter(centerId)

      return {
        isFavourite: false,
        message: sportCenter.detail.favoriteRemoved,
      }
    }

    await addFavoriteSportCenter(centerId)

    return {
      isFavourite: true,
      message: sportCenter.detail.favoriteAdded,
    }
  } catch (error) {
    return {
      isFavourite,
      error:
        error instanceof Error
          ? error.message
          : sportCenter.detail.favoriteError,
    }
  }
}
