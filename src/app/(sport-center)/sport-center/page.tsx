"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/features/sport-center/components/empty-state"
import { FilterSidebar } from "@/features/sport-center/components/filter-sidebar"
import { SportCenterCard } from "@/features/sport-center/components/sport-center-card"
import { SPORT_CENTERS } from "@/features/sport-center/mock-data/sport-center"

function getDistanceLabel(distanceKm: number) {
  if (distanceKm <= 5) return "< 5 km"
  if (distanceKm <= 10) return "5 - 10 km"
  if (distanceKm <= 20) return "10 - 20 km"
  return "> 20 km"
}

export default function FindSportCenterPage() {
  const [activeTab, setActiveTab] = useState("sport-center")
  const [search, setSearch] = useState("")
  const [addressFilter, setAddressFilter] = useState("all")
  const [distanceFilter, setDistanceFilter] = useState("all")
  const [playTimeFilter, setPlayTimeFilter] = useState("all")

  const filteredSportCenters = useMemo(() => {
    return SPORT_CENTERS.filter((sportCenter) => {
      const text = `${sportCenter.name} ${sportCenter.address}`.toLowerCase()
      const matchesSearch = text.includes(search.trim().toLowerCase())
      const matchesAddress =
        addressFilter === "all" ||
        sportCenter.region.toLowerCase() === addressFilter
      const matchesDistance =
        distanceFilter === "all" ||
        getDistanceLabel(sportCenter.distanceKm) === distanceFilter
      const matchesPlayTime =
        playTimeFilter === "all" ||
        sportCenter.playTimeTags.includes(playTimeFilter)

      return (
        matchesSearch && matchesAddress && matchesDistance && matchesPlayTime
      )
    })
  }, [search, addressFilter, distanceFilter, playTimeFilter])

  const bookedSportCenters = useMemo(() => SPORT_CENTERS.slice(0, 2), [])
  const favoriteSportCenters = useMemo(() => SPORT_CENTERS.slice(2, 5), [])

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6 flex justify-center">
          <TabsList className="w-full max-w-xl">
            <TabsTrigger value="sport-center">Sân</TabsTrigger>
            <TabsTrigger value="booking">Sân đã đặt</TabsTrigger>
            <TabsTrigger value="favorite">Sân yêu thích</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sport-center" className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Sân</h1>
          </section>

          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                EmptyState()
              )}
            </div>

            {/* Filter Sidebar */}
            <div>
              <FilterSidebar
                addressFilter={addressFilter}
                setAddressFilter={setAddressFilter}
                distanceFilter={distanceFilter}
                setDistanceFilter={setDistanceFilter}
                playTimeFilter={playTimeFilter}
                setPlayTimeFilter={setPlayTimeFilter}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Sân đã đặt</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bookedSportCenters.map((sportCenter) => (
              <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorite" className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Sân yêu thích</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {favoriteSportCenters.map((sportCenter) => (
              <SportCenterCard key={sportCenter.id} sportCenter={sportCenter} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
