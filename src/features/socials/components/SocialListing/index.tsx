"use client"

import { Filter, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockSocials } from "@/features/socials/mockData"
import useSocialsStore from "@/features/socials/stores/social-listing-store"

import FiltersDrawer from "./FiltersDrawer"
import SocialCard from "./SocialCard"

export default function SocialListing() {
  const router = useRouter()
  const searchQuery = useSocialsStore((s) => s.searchQuery)
  const setSearchQuery = useSocialsStore((s) => s.setSearchQuery)
  const filterDrawerOpen = useSocialsStore((s) => s.filterDrawerOpen)
  const setFilterDrawerOpen = useSocialsStore((s) => s.setFilterDrawerOpen)
  const filters = useSocialsStore((s) => s.filters)
  const setFilters = useSocialsStore((s) => s.setFilters)

  const filteredSocials = mockSocials.filter((social) => {
    if (
      searchQuery &&
      !social.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (filters.status !== "ALL" && social.status !== filters.status)
      return false
    if (
      filters.genderPolicy !== "ALL" &&
      social.genderPolicy !== filters.genderPolicy
    )
      return false
    if (filters.ageGroup !== "ALL" && social.ageGroup !== filters.ageGroup)
      return false
    if (filters.format !== "ALL" && social.format !== filters.format)
      return false
    if (filters.availableSlots && !social.hasAvailableSlots) return false
    return true
  })

  return (
    <div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder="Search socials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="h-11 gap-2"
            onClick={() => router.push("/socials/create")}
          >
            <Plus className="size-4" />
            Create Social
          </Button>
          <Button
            variant="outline"
            className="h-11 gap-2 md:w-auto"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <Filter className="size-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSocials.map((social) => (
            <SocialCard key={social.id} social={social} />
          ))}
        </div>
      </div>

      <FiltersDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}
