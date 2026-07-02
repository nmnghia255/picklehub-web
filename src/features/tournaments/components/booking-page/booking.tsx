"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { fetchBulkCourtAvailabilityAction } from "@/features/sport-center/actions/fetch-bulk-court-availability"
import { fetchSportCenterByIdAction } from "@/features/sport-center/actions/fetch-sport-center-by-id"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { getTournamentEventAction } from "../../actions/tournament-event-actions"
import { useBookingStore } from "../../stores/use-booking-store"
import BookingHeader from "./booking-header"
import BookingSummaryFooter from "./booking-summary-footer"
import ConfirmBookingDialog from "./confirm-booking-dialog"
import CourtTimelineGrid from "./court-timeline-grid"
import VenueInfoCard from "./venue-info-card"

export default function BookingPage() {
  const { t } = useTournamentTranslation()
  // Store t in a ref so effects can read the latest translator
  // without declaring it as a reactive dependency (t changes reference every render)
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  })
  const router = useRouter()
  const params = useParams<{ tournamentId: string; centerId: string }>()
  const searchParams = useSearchParams()
  const tournamentId = params.tournamentId ? Number(params.tournamentId) : null
  const centerId = params.centerId || null
  const eventId = searchParams.get("eventId")
  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")

  const isLoadingCenter = useBookingStore((s) => s.isLoadingCenter)
  const sportCenter = useBookingStore((s) => s.sportCenter)
  const activeDate = useBookingStore((s) => s.activeDate)

  const setTournamentId = useBookingStore((s) => s.setTournamentId)
  const setCenterId = useBookingStore((s) => s.setCenterId)
  const setSportCenter = useBookingStore((s) => s.setSportCenter)
  const setIsLoadingCenter = useBookingStore((s) => s.setIsLoadingCenter)
  const setCourtAvailability = useBookingStore((s) => s.setCourtAvailability)
  const setIsLoadingAvailability = useBookingStore(
    (s) => s.setIsLoadingAvailability
  )
  const setAvailabilityError = useBookingStore((s) => s.setAvailabilityError)
  const setSelectedEvent = useBookingStore((s) => s.setSelectedEvent)
  const setTournamentDateRange = useBookingStore(
    (s) => s.setTournamentDateRange
  )
  const reset = useBookingStore((s) => s.reset)

  // Sync parameters to store
  useEffect(() => {
    setTournamentId(tournamentId)
  }, [tournamentId, setTournamentId])

  useEffect(() => {
    setCenterId(centerId)
  }, [centerId, setCenterId])

  // Sync tournament date range so the calendar is constrained
  useEffect(() => {
    setTournamentDateRange(startDateParam, endDateParam)
  }, [startDateParam, endDateParam, setTournamentDateRange])

  // Fetch the selected event so booking page can show match count requirements
  useEffect(() => {
    if (!tournamentId || !eventId) {
      setSelectedEvent(null)
      return
    }
    let isActive = true
    void (async () => {
      const res = await getTournamentEventAction(String(tournamentId), eventId)
      if (isActive && res.success && res.data) {
        setSelectedEvent(res.data)
      }
    })()
    return () => {
      isActive = false
    }
  }, [tournamentId, eventId, setSelectedEvent])

  // Fetch Sport Center profile when centerId changes
  useEffect(() => {
    if (!centerId) return

    let isActive = true
    setIsLoadingCenter(true)

    void (async () => {
      try {
        const center = await fetchSportCenterByIdAction(centerId)
        if (isActive) {
          setSportCenter(center)
        }
      } catch (err) {
        if (isActive) {
          setSportCenter(null)
        }
      } finally {
        if (isActive) {
          setIsLoadingCenter(false)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [centerId, setSportCenter, setIsLoadingCenter])

  // Fetch availability when centerId or activeDate changes
  useEffect(() => {
    if (!centerId || !activeDate) return

    let isActive = true
    setIsLoadingAvailability(true)
    setAvailabilityError("")

    void (async () => {
      try {
        const availability = await fetchBulkCourtAvailabilityAction(
          centerId,
          activeDate
        )
        if (isActive) {
          setCourtAvailability(availability)
        }
      } catch (err) {
        console.error("Failed to load availability:", err)
        if (isActive) {
          setCourtAvailability(null)
          setAvailabilityError(
            tRef.current("booking.toasts.loadAvailabilityFailed", {
              defaultValue: "Failed to load court availability for this date",
            })
          )
        }
      } finally {
        if (isActive) {
          setIsLoadingAvailability(false)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [
    centerId,
    activeDate,
    setCourtAvailability,
    setIsLoadingAvailability,
    setAvailabilityError,
  ])

  // Reset store on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  if (isLoadingCenter) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!sportCenter) {
    return (
      <div className="w-full px-4 py-12 text-center sm:px-6 md:px-8">
        <p className="text-gray-500">
          {t("booking.page.centerNotFound", {
            defaultValue: "Sport center not found",
          })}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("booking.page.goBack", { defaultValue: "Go Back" })}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col space-y-6 bg-white px-4 pt-6 sm:px-6 md:px-8">
      <BookingHeader />
      <VenueInfoCard />
      <CourtTimelineGrid />
      <BookingSummaryFooter />
      <ConfirmBookingDialog />
    </div>
  )
}
