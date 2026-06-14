"use client"

import { Filter, Loader2, Plus, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useRef, useTransition } from "react"

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
import {
  useDiscoverFiltersStore,
  useMySocialsFiltersStore,
} from "@/features/socials/stores/social-filter-store"
import { useSocialsStore } from "@/features/socials/stores/social-listing-store"
import type { ListSocial as Social } from "@/features/socials/types/social"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
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
  isMySocials?: boolean
}

export default function SocialListing({
  initialSocials,
  pagination,
  isMySocials = false,
}: SocialListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useSocialsTranslation()

  const { data: subscriptions } = useMySubscriptions()
  const hasSocialHostPlan = subscriptions?.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "SOCIAL_HOST"
  )

  const useFiltersStore = isMySocials
    ? useMySocialsFiltersStore
    : useDiscoverFiltersStore

  const filterDrawerOpen = useFiltersStore((s) => s.filterDrawerOpen)
  const setFilterDrawerOpen = useFiltersStore((s) => s.setFilterDrawerOpen)
  const filters = useFiltersStore((s) => s.filters)

  const { setFilters, updateSingleFilter } = useFiltersStore()
  const resetFilters = useFiltersStore((state) => state.resetFilters)
  const setSelectedSocial = useSocialsStore((s) => s.setSelectedSocial)

  const isInitialized = useRef(false)
  const [isPending, startTransition] = useTransition()

  // Initialize filters from URL on mount
  useEffect(() => {
    if (!isInitialized.current) {
      const urlFilters: Record<string, string | boolean> = {}
      searchParams.forEach((value, key) => {
        if (value === "true") urlFilters[key] = true
        else if (value === "false") urlFilters[key] = false
        else urlFilters[key] = value
      })

      setFilters(urlFilters)
      isInitialized.current = true
    }
  }, [searchParams, setFilters])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    let hasChanges = false

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "page" || key === "limit") return

      if (value !== null && value !== undefined && value !== "") {
        const strValue = String(value)
        if (params.get(key) !== strValue) {
          params.set(key, strValue)
          hasChanges = true
        }
      } else {
        if (params.has(key)) {
          params.delete(key)
          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      params.delete("page") // Reset to page 1 on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }
  }

  const socials: Social[] = initialSocials

  const hasNoResults = socials.length === 0

  const handleCardClick = (social: Social) => {
    setSelectedSocial(social)
    router.push(`/socials/${social.id}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const hasNextPage = pagination && pagination.page < pagination.totalPages
  const hasPrevPage = pagination && pagination.page > 1

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {isMySocials ? t("mySocials.title") : t("listing.title")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {isMySocials ? t("mySocials.subtitle") : t("listing.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {!isMySocials ? (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder={t("listing.searchPlaceholder")}
              value={filters.search ?? ""}
              onChange={(e) => updateSingleFilter("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters()
              }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {hasSocialHostPlan && (
          <Button
            className="h-11 gap-2"
            onClick={() => router.push("/socials/create")}
          >
            <Plus className="size-4" />
            {t("listing.createSocial")}
          </Button>
        )}
        <Button
          variant="outline"
          className="h-11 gap-2 md:w-auto"
          onClick={() => setFilterDrawerOpen(true)}
        >
          <Filter className="size-4" />
          {t("listing.filters")}
        </Button>
      </div>

      <div className="relative min-h-[200px]">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div
          className={`transition-opacity duration-200 ${
            isPending ? "pointer-events-none opacity-50" : ""
          }`}
        >
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
                <Button
                  variant="outline"
                  onClick={() => {
                    resetFilters()
                    // Small delay to let Zustand update before pushing URL
                    setTimeout(() => {
                      applyFilters()
                    }, 0)
                  }}
                >
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
        </div>
      </div>

      <FiltersDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        isMySocials={isMySocials}
        onApply={() => {
          applyFilters()
          setFilterDrawerOpen(false)
        }}
      />
    </div>
  )
}
