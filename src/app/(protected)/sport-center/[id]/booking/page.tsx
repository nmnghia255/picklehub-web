"use client"

import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { fetchBulkCourtAvailabilityAction } from "@/features/sport-center/actions/fetch-bulk-court-availability"
import { fetchSportCenterProductsAction } from "@/features/sport-center/actions/fetch-sport-center-products"
import { fetchSportCenterServicesAction } from "@/features/sport-center/actions/fetch-sport-center-services"
import { BookingServicesCard } from "@/features/sport-center/components/booking/booking-add-ons-card"
import { BookingAvailableCourtsCard } from "@/features/sport-center/components/booking/booking-available-courts-card"
import { BookingCourtInfoCard } from "@/features/sport-center/components/booking/booking-court-info-card"
import { BookingDateSelectionCard } from "@/features/sport-center/components/booking/booking-date-selection-card"
import { BookingNote } from "@/features/sport-center/components/booking/booking-note"
import { BookingSummaryCard } from "@/features/sport-center/components/booking/booking-summary-card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

export default function BookingPage() {
  const { t } = useSportCenterTranslation()
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const bookingNote = useBookingStore((state) => state.bookingNote)
  const sportCenter = useSportCenterStore((state) => state.sportCenter)
  const initializeBooking = useBookingStore((state) => state.initializeBooking)
  const setBookingNote = useBookingStore((state) => state.setBookingNote)

  useEffect(() => {
    let isActive = true

    if (centerId) {
      initializeBooking(centerId)

      void (async () => {
        try {
          const [services, products] = await Promise.all([
            fetchSportCenterServicesAction(centerId),
            fetchSportCenterProductsAction(centerId),
          ])

          if (!isActive) return

          const selectedServices = services.reduce<Record<string, boolean>>(
            (acc, service) => {
              acc[service.id] = false
              return acc
            },
            {}
          )

          const selectedProducts = products.reduce<Record<string, number>>(
            (acc, product) => {
              acc[product.id] = 0
              return acc
            },
            {}
          )

          useBookingStore.setState({
            services,
            selectedServices,
            products,
            selectedProducts,
          })
          useBookingStore.getState().recalculateTotal()
        } catch {
          if (!isActive) return

          useBookingStore.setState({
            services: [],
            selectedServices: {},
            products: [],
            selectedProducts: {},
          })
          useBookingStore.getState().recalculateTotal()
        }
      })()
    }

    return () => {
      isActive = false
    }
  }, [centerId, initializeBooking])

  useEffect(() => {
    let isActive = true

    if (centerId && selectedDate) {
      useBookingStore.setState({
        isLoadingAvailability: true,
        availabilityError: "",
      })

      void (async () => {
        try {
          const courtAvailability = await fetchBulkCourtAvailabilityAction(
            centerId,
            selectedDate
          )

          if (!isActive) return

          useBookingStore.setState({ courtAvailability })
          useBookingStore.getState().recalculateTotal()
        } catch (error) {
          if (!isActive) return

          useBookingStore.setState({
            courtAvailability: null,
            availabilityError:
              error instanceof Error
                ? error.message
                : t("booking.errorLoadAvailability"),
          })
        } finally {
          if (isActive) {
            useBookingStore.setState({ isLoadingAvailability: false })
          }
        }
      })()
    }

    return () => {
      isActive = false
    }
  }, [centerId, selectedDate, t])

  return (
    <PageContainer variant="wide" className="flex flex-col">
      <section className="mb-6 flex items-start justify-between gap-4 space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("booking.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("booking.description")}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> {t("detail.header.back")}
        </Button>
      </section>

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BookingCourtInfoCard sportCenter={sportCenter} />
          <BookingDateSelectionCard />
          <BookingAvailableCourtsCard />
          <BookingServicesCard />
          <BookingNote note={bookingNote} onNoteChange={setBookingNote} />
        </div>

        <aside className="xl:sticky xl:top-6">
          <BookingSummaryCard />
        </aside>
      </section>
    </PageContainer>
  )
}
