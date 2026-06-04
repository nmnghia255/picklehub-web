"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { EmptyState } from "@/features/sport-center/components/sport-center-listing/empty-state"
import { FilterSidebar } from "@/features/sport-center/components/sport-center-listing/filter-sidebar"
import { SportCenterCard } from "@/features/sport-center/components/sport-center-listing/sport-center-card"
import type { SportCenterPaginationState } from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface SportCenterTabContentProps {
  filteredSportCenters: SportCenter[]
  activePagination: SportCenterPaginationState
  searchQuery: string
  onSearchQueryChange: (value: string) => void
}

export function SportCenterTabContent({
  filteredSportCenters,
  activePagination,
  searchQuery,
  onSearchQueryChange,
}: SportCenterTabContentProps) {
  const { t } = useSportCenterTranslation()

  return (
    <section className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder={t("listing.searchPlaceholder")}
              className="pl-9"
            />
          </div>

          <FilterSidebar />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("listing.resultsMatch", { count: filteredSportCenters.length })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("listing.pageInfo", {
              currentPage: activePagination.currentPage,
              totalPages: Math.max(
                1,
                Math.ceil(activePagination.total / activePagination.pageSize)
              ),
            })}
          </p>
        </div>

        {filteredSportCenters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSportCenters.map((sportCenter) => (
              <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
            ))}
          </div>
        ) : (
          <EmptyState variant="sport-center" />
        )}
      </div>
    </section>
  )
}
