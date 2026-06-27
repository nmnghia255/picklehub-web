"use client"

import { useEffect } from "react"

import { Pagination } from "@/components/common/pagination"
import { SportCenterTabContent } from "@/features/sport-center/components/sport-center-listing/sport-center-tab-content"
import {
  type SportCenterPaginationState,
  useSportCenterStore,
} from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface SportCenterBrowserProps {
  sportCenters: SportCenter[]
  favoriteOnly: boolean
  pagination: SportCenterPaginationState
}

export function SportCenterBrowser({
  sportCenters,
  favoriteOnly,
  pagination,
}: SportCenterBrowserProps) {
  const searchQuery = useSportCenterStore((state) => state.searchQuery)
  const setSearchQuery = useSportCenterStore((state) => state.setSearchQuery)
  const setFavoriteFilter = useSportCenterStore(
    (state) => state.setFavoriteFilter
  )
  const setSportCenters = useSportCenterStore((state) => state.setSportCenters)
  const setPagination = useSportCenterStore((state) => state.setPagination)
  const getFilteredSportCenters = useSportCenterStore(
    (state) => state.getFilteredSportCenters
  )
  const storePagination = useSportCenterStore((state) => state.pagination)
  const { t } = useSportCenterTranslation()

  useEffect(() => {
    setSportCenters(sportCenters)
  }, [setSportCenters, sportCenters])

  useEffect(() => {
    setFavoriteFilter(favoriteOnly ? "favorite" : "all")
  }, [favoriteOnly, setFavoriteFilter])

  useEffect(() => {
    setPagination(pagination)
  }, [pagination, setPagination])

  const filteredSportCenters = getFilteredSportCenters()
  const activePagination = storePagination ?? pagination

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-xl">
          <h2 className="sr-only">{t("listing.title")}</h2>
        </div>
      </div>

      <div className="space-y-6">
        <SportCenterTabContent
          filteredSportCenters={filteredSportCenters}
          activePagination={activePagination}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>

      <div className="mt-auto flex justify-center pt-6">
        <Pagination
          className="w-full"
          currentPage={activePagination.currentPage}
          hasPreviousPage={activePagination.currentPage > 1}
          hasNextPage={activePagination.hasNextPage}
          createHref={(page) => {
            const favoriteQuery = favoriteOnly ? "&favorite=favorite" : ""
            return page === 1
              ? `/sport-center${favoriteQuery}`
              : `/sport-center?page=${page}${favoriteQuery}`
          }}
          variant="simple"
        />
      </div>
    </div>
  )
}
