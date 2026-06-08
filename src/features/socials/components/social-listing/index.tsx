"use client"

import { Filter, Plus, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSocialsStore } from "@/features/socials/stores/social-listing-store"
import type { ListSocial as Social } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { FiltersDrawer } from "./filters-drawer"
import SocialCard from "./social-card"

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SocialListingProps {
  initialSocials: Social[]
  pagination?: PaginationMeta
}

export default function SocialListing({
  initialSocials,
  pagination,
}: SocialListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useSocialsTranslation()

  const filterDrawerOpen = useSocialsStore((s) => s.filterDrawerOpen)
  const setFilterDrawerOpen = useSocialsStore((s) => s.setFilterDrawerOpen)
  const filters = useSocialsStore((s) => s.filters)

  const { setFilters, updateSingleFilter } = useSocialsStore()
  const resetFilters = useSocialsStore((state) => state.resetFilters)
  const setSelectedSocial = useSocialsStore((s) => s.setSelectedSocial)

  const socials: Social[] = initialSocials

  const hasNoResults = socials.length === 0

  const handleCardClick = (social: Social) => {
    setSelectedSocial(social)
    router.push(`/socials/${social.id}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasNextPage = pagination && pagination.page < pagination.totalPages
  const hasPrevPage = pagination && pagination.page > 1

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
        <Empty className="my-10 border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>{t("listing.noResultsTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("listing.noResultsDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => resetFilters()}>
              {t("common.clearFilters", { defaultValue: "Clear Filters" })}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {socials.map((social) => (
              <SocialCard
                key={social.id}
                social={social}
                onClick={() => handleCardClick(social)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {hasPrevPage ? (
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pagination.page - 1)
                        }}
                      />
                    ) : (
                      <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                        {t("common.previous", { defaultValue: "Previous" })}
                      </span>
                    )}
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationLink isActive size="default" href="#">
                      {t("common.page", {
                        page: pagination.page,
                        defaultValue: `Trang ${pagination.page}`,
                      })}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    {hasNextPage ? (
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pagination.page + 1)
                        }}
                      />
                    ) : (
                      <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                        {t("common.next", { defaultValue: "Next" })}
                      </span>
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
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
