import { PageContainer } from "@/components/page-container"
import { BookingService } from "@/features/sport-center/api/booking-service"
import {
  listSportCenters,
  type ListSportCentersResult,
} from "@/features/sport-center/api/sport-center-service"
import { SportCenterBrowser } from "@/features/sport-center/components/sport-center-listing"
import type { BookingStatus } from "@/features/sport-center/types/booking"
import type { SportCenter } from "@/features/sport-center/types/sport-center"

const PAGE_SIZE = 20
const BOOKING_PAGE_SIZE = 100
const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]

type PageProps = {
  searchParams?: Promise<{ page?: string; favorite?: string }>
}

export default async function SportCenterPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawPage = Number.parseInt(resolvedSearchParams?.page ?? "1", 10)
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  const offset = (currentPage - 1) * PAGE_SIZE
  const favoriteOnly = resolvedSearchParams?.favorite === "favorite"

  let sportCentersResult: ListSportCentersResult = {
    data: [],
    pagination: undefined,
  }
  const bookedSportCenters: SportCenter[] = []

  try {
    const [sportCentersResponse, bookingResponses] = await Promise.all([
      listSportCenters(PAGE_SIZE, offset, undefined, favoriteOnly),
      Promise.allSettled(
        BOOKING_STATUSES.map((status) =>
          BookingService.getMyBookings(status, "", "", "", BOOKING_PAGE_SIZE, 0)
        )
      ),
    ])

    sportCentersResult = sportCentersResponse

    const bookings = bookingResponses.flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    )

    const seenCenterIds = new Set<string>()
    // bookedSportCenters = bookings.reduce<SportCenter[]>((centers, booking) => {
    //   const center = booking.court.center

    //   if (seenCenterIds.has(center.id)) {
    //     return centers
    //   }

    //   seenCenterIds.add(center.id)
    //   centers.push(center)
    //   return centers
    // }, [])
  } catch (error) {
    console.error("Failed to fetch sport centers or bookings:", error)
    return (
      <PageContainer variant="wide">
        <div className="p-4">
          <p className="text-red-500">
            Không thể tải danh sách trung tâm thể thao. Vui lòng thử lại sau.
          </p>
        </div>
      </PageContainer>
    )
  }

  const sportCenters = sportCentersResult.data
  const pagination = sportCentersResult.pagination ?? {
    total: sportCenters.length,
    offset,
    limit: PAGE_SIZE,
  }
  const hasNextPage = pagination.offset + pagination.limit < pagination.total

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-[calc(100vh-3.5rem)] flex-col"
    >
      <SportCenterBrowser
        sportCenters={sportCenters}
        bookedSportCenters={bookedSportCenters}
        favoriteOnly={favoriteOnly}
        pagination={{
          currentPage,
          pageSize: pagination.limit,
          total: pagination.total,
          offset: pagination.offset,
          hasNextPage,
        }}
      />
    </PageContainer>
  )
}
