"use client"

import { Search } from "lucide-react"
import { useEffect } from "react"

import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/features/sport-center/components/sport-center-listing/empty-state"
import { FilterSidebar } from "@/features/sport-center/components/sport-center-listing/filter-sidebar"
import { SportCenterCard } from "@/features/sport-center/components/sport-center-listing/sport-center-card"
import {
  type SportCenterPaginationState,
  type SportCenterTab,
  useSportCenterStore,
} from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

interface SportCenterBrowserProps {
  sportCenters: SportCenter[]
  pagination: SportCenterPaginationState
}

export function SportCenterBrowser({
  sportCenters,
  pagination,
}: SportCenterBrowserProps) {
  const activeTab = useSportCenterStore((state) => state.activeTab)
  const setActiveTab = useSportCenterStore((state) => state.setActiveTab)
  const searchQuery = useSportCenterStore((state) => state.searchQuery)
  const setSearchQuery = useSportCenterStore((state) => state.setSearchQuery)
  const setSportCenters = useSportCenterStore((state) => state.setSportCenters)
  const setPagination = useSportCenterStore((state) => state.setPagination)
  const getFilteredSportCenters = useSportCenterStore(
    (state) => state.getFilteredSportCenters
  )
  const getBookedSportCenters = useSportCenterStore(
    (state) => state.getBookedSportCenters
  )
  const storePagination = useSportCenterStore((state) => state.pagination)

  useEffect(() => {
    setSportCenters(sportCenters)
  }, [setSportCenters, sportCenters])

  useEffect(() => {
    setPagination(pagination)
  }, [pagination, setPagination])

  const filteredSportCenters = getFilteredSportCenters()
  const bookedSportCenters = getBookedSportCenters()
  const activePagination = storePagination ?? pagination
  const previousPage = Math.max(1, activePagination.currentPage - 1)
  const nextPage = activePagination.currentPage + 1
  const previousHref =
    previousPage === 1 ? "/sport-center" : `/sport-center?page=${previousPage}`
  const nextHref = `/sport-center?page=${nextPage}`

  return (
    <div className="flex flex-1 flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SportCenterTab)}
      >
        <div className="mb-6 flex justify-center">
          <TabsList className="w-full max-w-xl">
            <TabsTrigger value="sport-center">Sân</TabsTrigger>
            <TabsTrigger value="booking">Sân đã đặt</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sport-center" className="space-y-6">
          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm kiếm theo tên sân hoặc địa chỉ"
                  className="pl-9"
                />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {filteredSportCenters.length} kết quả phù hợp
                </h2>
                <p className="text-sm text-muted-foreground">
                  Trang {activePagination.currentPage} /{" "}
                  {Math.max(
                    1,
                    Math.ceil(
                      activePagination.total / activePagination.pageSize
                    )
                  )}
                </p>
              </div>

              {filteredSportCenters.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredSportCenters.map((sportCenter) => (
                    <SportCenterCard
                      key={sportCenter.id}
                      sportCenter={sportCenter}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState variant="sport-center" />
              )}
            </div>

            <div>
              <FilterSidebar />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          {bookedSportCenters.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {bookedSportCenters.map((sportCenter) => (
                <SportCenterCard
                  key={sportCenter.id}
                  sportCenter={sportCenter}
                />
              ))}
            </div>
          ) : (
            <EmptyState variant="booking" />
          )}
        </TabsContent>
      </Tabs>

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
