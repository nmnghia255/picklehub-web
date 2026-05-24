"use client"

import { BadgeDollarSign, ShieldCheck } from "lucide-react"
import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import {
  CreditCardMobile,
  CreditDetailDrawer,
  CreditEmptyState,
  CreditFilters,
  CreditPageSkeleton,
  CreditStats,
  CreditTable,
} from "@/features/sport-center-management/components/court-credits-management"
import type { CreditRecord } from "@/features/sport-center-management/credit-management/court-credits-data"
import type { CancellationReason } from "@/features/sport-center-management/credit-management/court-credits-data"
import {
  type CreditSortValue,
  useCreditManagementStore,
} from "@/features/sport-center-management/stores/court-credits-store"
import { useCourtCreditsTranslation } from "@/i18n/use-court-credits-translation"

export default function CourtCreditsPage() {
  const { t } = useCourtCreditsTranslation()
  const isLoading = useCreditManagementStore((state) => state.isLoading)
  const credits = useCreditManagementStore((state) => state.credits)
  const search = useCreditManagementStore((state) => state.search)

  const cancellationReasonFilter = useCreditManagementStore(
    (state) => state.cancellationReasonFilter
  )
  const courtFilter = useCreditManagementStore((state) => state.courtFilter)
  const sortBy = useCreditManagementStore((state) => state.sortBy)

  const selectedCreditId = useCreditManagementStore(
    (state) => state.selectedCreditId
  )
  const detailOpen = useCreditManagementStore((state) => state.detailOpen)
  const setIsLoading = useCreditManagementStore((state) => state.setIsLoading)
  const setSearch = useCreditManagementStore((state) => state.setSearch)

  const setCancellationReasonFilter = useCreditManagementStore(
    (state) => state.setCancellationReasonFilter
  )
  const setCourtFilter = useCreditManagementStore(
    (state) => state.setCourtFilter
  )
  const setSortBy = useCreditManagementStore((state) => state.setSortBy)

  const openCredit = useCreditManagementStore((state) => state.openCredit)
  const setDetailOpen = useCreditManagementStore((state) => state.setDetailOpen)

  const cancelCredit = useCreditManagementStore((state) => state.cancelCredit)
  const createManualCredit = useCreditManagementStore(
    (state) => state.createManualCredit
  )
  const resetFilters = useCreditManagementStore((state) => state.resetFilters)
  const resetMockCredits = useCreditManagementStore(
    (state) => state.resetMockCredits
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [setIsLoading])

  const selectedCredit = useMemo(() => {
    return credits.find((item) => item.id === selectedCreditId) ?? null
  }, [credits, selectedCreditId])

  const filteredCredits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const sorted = credits
      .filter((credit) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [
            credit.id,
            credit.creditCode,
            credit.customerName,
            credit.phone,
            credit.bookingCode,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        const matchesReason =
          cancellationReasonFilter === "all" ||
          credit.cancellationReason === cancellationReasonFilter
        const matchesCourt =
          courtFilter === "all" ||
          credit.courtName.toLowerCase().includes(courtFilter.replace("-", " "))

        return matchesSearch && matchesReason && matchesCourt
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "credit-amount-high":
            return right.creditAmount - left.creditAmount
          case "remaining-high":
            return right.remainingAmount - left.remainingAmount
          case "customer-a-z":
            return left.customerName.localeCompare(right.customerName)
          case "latest-created":
          default:
            return (
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime()
            )
        }
      })

    return sorted
  }, [cancellationReasonFilter, courtFilter, credits, search, sortBy])

  const stats = useMemo(() => {
    const totalCreditValue = credits.reduce(
      (sum, credit) => sum + credit.creditAmount,
      0
    )

    return {
      totalCreditValue,
      totalCredits: credits.length,
    }
  }, [credits])

  const sortOptions = useMemo<Array<{ value: CreditSortValue; label: string }>>(
    () => [
      { value: "latest-created", label: t("sort.latestCreated") },
      { value: "soonest-expiry", label: t("sort.soonestExpiry") },
      { value: "credit-amount-high", label: t("sort.highestCreditAmount") },
      { value: "remaining-high", label: t("sort.highestRemainingAmount") },
      { value: "customer-a-z", label: t("sort.customerAZ") },
    ],
    [t]
  )

  const courtOptions = useMemo(
    () => [
      { value: "all", label: t("filters.courts.all") },
      { value: "court-a", label: t("filters.courts.courtA") },
      { value: "court-b", label: t("filters.courts.courtB") },
      { value: "court-c", label: t("filters.courts.courtC") },
      { value: "court-d", label: t("filters.courts.courtD") },
      { value: "center-court", label: t("filters.courts.centerCourt") },
    ],
    [t]
  )

  const cancellationReasonOptions = useMemo<
    Array<{ value: "all" | CancellationReason; label: string }>
  >(
    () => [
      { value: "all", label: t("filters.reasons.all") },
      {
        value: "CUSTOMER_CANCELLED",
        label: t("filters.reasons.customerCancelled"),
      },
      {
        value: "OWNER_CANCELLED",
        label: t("filters.reasons.ownerCancelled"),
      },
      { value: "WEATHER", label: t("filters.reasons.weather") },
      { value: "MAINTENANCE", label: t("filters.reasons.maintenance") },
      { value: "OTHER", label: t("filters.reasons.other") },
    ],
    [t]
  )

  const handleViewCredit = (credit: CreditRecord) => {
    openCredit(credit)
  }

  if (isLoading) {
    return (
      <PageContainer variant="wide" className="relative min-h-screen">
        <CreditPageSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              {t("page.badge")}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("page.title")}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {t("page.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
              <BadgeDollarSign className="size-4 text-sky-500" />
              {t("page.mockCredits", { count: credits.length })}
            </div>
          </div>
        </div>
      </section>

      <CreditStats
        totalCreditValue={stats.totalCreditValue}
        totalCredits={stats.totalCredits}
      />

      <section className="space-y-5">
        <div className="sticky top-4 z-30 -mx-1">
          <div className="space-y-4 rounded-3xl border bg-background/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur supports-backdrop-filter:bg-background/85 sm:p-5">
            <CreditFilters
              search={search}
              cancellationReasonFilter={cancellationReasonFilter}
              courtFilter={courtFilter}
              sortBy={sortBy}
              courts={courtOptions}
              cancellationReasonOptions={cancellationReasonOptions}
              sortOptions={sortOptions}
              onSearchChange={setSearch}
              onCancellationReasonFilterChange={setCancellationReasonFilter}
              onCourtFilterChange={setCourtFilter}
              onSortChange={(value) => setSortBy(value as CreditSortValue)}
              onReset={resetFilters}
            />
          </div>
        </div>

        {credits.length === 0 ? (
          <CreditEmptyState
            title={t("empty.noCreditsTitle")}
            description={t("empty.noCreditsDescription")}
            actionLabel={t("empty.restoreMockCredits")}
            onAction={resetMockCredits}
          />
        ) : filteredCredits.length === 0 ? (
          <CreditEmptyState
            title={t("empty.noMatchesTitle")}
            description={t("empty.noMatchesDescription")}
            actionLabel={t("empty.clearFilters")}
            onAction={resetFilters}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <CreditTable
                credits={filteredCredits}
                onView={handleViewCredit}
                onRowClick={openCredit}
                onCancelCredit={cancelCredit}
                onCreateManualCredit={createManualCredit}
              />
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredCredits.map((credit) => (
                <CreditCardMobile
                  key={credit.id}
                  credit={credit}
                  onView={handleViewCredit}
                  onOpen={openCredit}
                  onCancelCredit={cancelCredit}
                  onCreateManualCredit={createManualCredit}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <CreditDetailDrawer
        credit={selectedCredit}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onCancelCredit={cancelCredit}
      />
    </PageContainer>
  )
}
