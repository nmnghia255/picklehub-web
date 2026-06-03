"use client"

import { Filter, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockSocials } from "@/features/socials/mock-data/mockData"
import { useSocialsStore } from "@/features/socials/stores/social-listing-store"
// import { SocialService } from "@/features/socials/api/social-service"
import type { ListSocialResponse as Social } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { FiltersDrawer } from "./FiltersDrawer"
import SocialCard from "./SocialCard"

export default function SocialListing() {
  const router = useRouter()
  const { t } = useSocialsTranslation()

  const filterDrawerOpen = useSocialsStore((s) => s.filterDrawerOpen)
  const setFilterDrawerOpen = useSocialsStore((s) => s.setFilterDrawerOpen)
  const filters = useSocialsStore((s) => s.filters)

  const { setFilters, updateSingleFilter } = useSocialsStore()
  const resetFilters = useSocialsStore((state) => state.resetFilters)

  const socials: Social[] = mockSocials

  // try {
  //   const fetchSocials = async () => {
  //     const response = await SocialService.listMySocials(
  //       null,
  //       null,
  //       null,
  //       null
  //     )
  //     socials = response
  //   }
  // }
  // catch (error) {
  //   console.error("Error fetching socials:", error)
  //   return (
  //     < PageContainer variant="wide" >
  //       <div className="p-4">
  //         <p className="text-red-500">
  //           Không thể tải danh sách buổi chơi. Vui lòng thử lại sau.
  //         </p>
  //       </div>
  //     </PageContainer >
  //   )
  // }

  const hasNoResults = socials.length === 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("listing.title")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("listing.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-10"
            placeholder={t("listing.searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) => updateSingleFilter("search", e.target.value)}
          />
        </div>
        <Button
          className="h-11 gap-2"
          onClick={() => router.push("/socials/create")}
        >
          <Plus className="size-4" />
          {t("listing.createSocial")}
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 md:w-auto"
          onClick={() => setFilterDrawerOpen(true)}
        >
          <Filter className="size-4" />
          {t("listing.filters")}
        </Button>
      </div>

      {hasNoResults ? (
        <div className="rounded-3xl border border-dashed border-border px-6 py-14 text-center">
          <h2 className="text-lg font-semibold">
            {t("listing.noResultsTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("listing.noResultsDescription")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {socials.map((social) => (
            <SocialCard key={social.id} social={social} />
          ))}
        </div>
      )}

      <FiltersDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
    </div>
  )
}
