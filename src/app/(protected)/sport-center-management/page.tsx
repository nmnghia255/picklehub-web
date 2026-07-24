"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { PageContainer } from "@/components/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingListPageContent } from "@/features/sport-center-management/components/booking-list/booking-list-page-content"
import { SportCenterManagementPage } from "@/features/sport-center-management/components/center-list/sport-center-management-page"
import { CourtScheduleWrapper } from "@/features/sport-center-management/components/courts-management/court-schedule-wrapper"
import { CustomerManagementPageContent } from "@/features/sport-center-management/components/customer/customer-management-page-content"
import { RevenueReportPage } from "@/features/sport-center-management/revenue-report/components/revenue-report-page"
import { ServicesProductsManagementPage } from "@/features/sport-center-management/services-products-management/components/services-products-management-page"
import { useBookingListStore } from "@/features/sport-center-management/stores/booking-list-store"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

export default function SportCenterManagementListRoute() {
  const { t: tManagement } = useSportCenterManagementTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "centers"

  const sportCenters = useCourtScheduleStore((state) => state.sportCenters)
  const centerId = useCourtScheduleStore((state) => state.centerId)
  const loadingSportCenters = useCourtScheduleStore(
    (state) => state.loadingSportCenters
  )
  const fetchSportCenters = useCourtScheduleStore(
    (state) => state.fetchSportCenters
  )
  const createdAtFilter = useBookingListStore((state) => state.createdAtFilter)
  const statusFilter = useBookingListStore((state) => state.statusFilter)

  useEffect(() => {
    if (!sportCenters.length) {
      void fetchSportCenters()
    }
  }, [fetchSportCenters, sportCenters.length])

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", value)
    router.push(`/sport-center-management?${params.toString()}`)
  }

  return (
    <PageContainer variant="wide" className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {tManagement("tabs.centerManagement")}
          </h1>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="flex h-auto w-full scrollbar-none justify-start gap-1 overflow-x-auto rounded-xl border bg-muted/50 p-px [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="centers"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.centerList")}
          </TabsTrigger>
          <TabsTrigger
            value="courts"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.courtManagement")}
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.bookingList")}
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.customerManagement")}
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.servicesProducts")}
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            {tManagement("tabs.revenueReport")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="centers" className="focus-visible:outline-hidden">
          <SportCenterManagementPage />
        </TabsContent>

        <TabsContent value="courts" className="focus-visible:outline-hidden">
          <div className="flex flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-xs">
            <header className="flex shrink-0 items-center pb-4">
              <h2 className="text-2xl font-semibold">
                {tManagement("courts.page.title")}
              </h2>
            </header>
            <CourtScheduleWrapper />
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="focus-visible:outline-hidden">
          <BookingListPageContent
            key={`${centerId ?? "none"}-${createdAtFilter}-${statusFilter}`}
            centerId={centerId}
            loadingSportCenters={loadingSportCenters}
            sportCenters={sportCenters}
            createdAtFilter={createdAtFilter}
            statusFilter={statusFilter}
            noContainer
          />
        </TabsContent>

        <TabsContent value="customers" className="focus-visible:outline-hidden">
          <CustomerManagementPageContent noContainer />
        </TabsContent>

        <TabsContent value="services" className="focus-visible:outline-hidden">
          <ServicesProductsManagementPage noContainer />
        </TabsContent>

        <TabsContent value="analytics" className="focus-visible:outline-hidden">
          <RevenueReportPage noContainer />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
