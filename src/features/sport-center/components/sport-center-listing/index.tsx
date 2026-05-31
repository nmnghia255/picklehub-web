"use client"

import { useEffect } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {} from /* Tabs removed */ "@/components/ui/tabs"
import { SportCenterTabContent } from "@/features/sport-center/components/sport-center-listing/sport-center-tab-content"
import {
  type SportCenterPaginationState,
  useSportCenterStore,
} from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

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
  const previousPage = Math.max(1, activePagination.currentPage - 1)
  const nextPage = activePagination.currentPage + 1
  const favoriteQuery = favoriteOnly ? "&favorite=favorite" : ""
  const previousHref =
    previousPage === 1
      ? `/sport-center${favoriteQuery}`
      : `/sport-center?page=${previousPage}${favoriteQuery}`
  const nextHref = `/sport-center?page=${nextPage}${favoriteQuery}`

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-xl">
          <h2 className="sr-only">Sân</h2>
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
        <Pagination className="w-full">
          <PaginationContent className="justify-center">
            <PaginationItem>
              {activePagination.currentPage === 1 ? (
                <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                  Previous
                </span>
              ) : (
                <PaginationPrevious href={previousHref} />
              )}
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive size="default" href="#">
                Trang {activePagination.currentPage}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              {activePagination.hasNextPage ? (
                <PaginationNext href={nextHref} />
              ) : (
                <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                  Next
                </span>
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
