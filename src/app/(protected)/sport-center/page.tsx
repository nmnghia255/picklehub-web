"use client"

import { Search } from "lucide-react"
import { useEffect } from "react"

import { PageContainer } from "@/components/page-container"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/features/sport-center/components/empty-state"
import { FilterSidebar } from "@/features/sport-center/components/filter-sidebar"
import { SportCenterCard } from "@/features/sport-center/components/sport-center-card"
import { SPORT_CENTERS } from "@/features/sport-center/mock-data/sport-center"
import {
  type SportCenterTab,
  useSportCenterStore,
} from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

export default function SportCenterPage() {
  const activeTab = useSportCenterStore((state) => state.activeTab)
  const setActiveTab = useSportCenterStore((state) => state.setActiveTab)
  const searchQuery = useSportCenterStore((state) => state.searchQuery)
  const setSearchQuery = useSportCenterStore((state) => state.setSearchQuery)
  const setSportCenters = useSportCenterStore((state) => state.setSportCenters)
  const getFilteredSportCenters = useSportCenterStore(
    (state) => state.getFilteredSportCenters
  )
  const getBookedSportCenters = useSportCenterStore(
    (state) => state.getBookedSportCenters
  )

  // Initialize sport centers from mock data
  useEffect(() => {
    setSportCenters(SPORT_CENTERS as SportCenter[])
  }, [setSportCenters])

  const filteredSportCenters = getFilteredSportCenters()
  const bookedSportCenters = getBookedSportCenters()

  return (
    <PageContainer variant="wide">
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

              {/* Search Results */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {filteredSportCenters.length} kết quả phù hợp
                </h2>
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
                <EmptyState />
              )}
            </div>

            {/* Filter Sidebar */}
            <div>
              <FilterSidebar />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bookedSportCenters.map((sportCenter) => (
              <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
