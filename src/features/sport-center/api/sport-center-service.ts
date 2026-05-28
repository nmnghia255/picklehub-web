import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Booking, BookingRequest, BookingStatus } from "../types/booking"
import type { BulkCourtAvailability, CourtResponse } from "../types/court"
import type { Product } from "../types/product"
import type { Review } from "../types/review"
import type { Service } from "../types/service"
import type {
  PriceSlot,
  SportCenter,
  SportCenterFavorite,
  SportCenterStatus,
} from "../types/sport-center"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset: number
    limit: number
  }
}

export interface SportCenterPagination {
  total: number
  offset: number
  limit: number
}

export interface ListSportCentersResult {
  data: SportCenter[]
  pagination?: SportCenterPagination
}

function normalizeSportCentersResponse(
  payload: ApiResponse<SportCenter[]> | SportCenter[]
): ListSportCentersResult {
  if (Array.isArray(payload)) {
    return { data: payload }
  }

  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    pagination: payload.pagination,
  }
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

// ============================================
// Sport Center
// ============================================

export async function listSportCenters(
  limit?: number,
  offset?: number,
  status?: SportCenterStatus,
  favouritesOnly?: boolean
): Promise<ListSportCentersResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<SportCenter[]> | SportCenter[]>(
    "/api/sport-centers",
    {
      params: {
        limit,
        offset,
        status,
        favouritesOnly,
      },
    }
  )
  return normalizeSportCentersResponse(response.data)
}

export async function getSportCenterById(
  centerId: string
): Promise<SportCenter> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<SportCenter> | SportCenter>(
    `/api/sport-centers/${centerId}`
  )
  return unwrapApiResponse(response.data)
}

export async function getSportCenterPriceSlots(
  centerId: string
): Promise<PriceSlot[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<PriceSlot[]> | PriceSlot[]>(
    `/api/sport-centers/${centerId}/price-slots`
  )
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Courts
// ============================================

export async function getSportCenterCourts(
  centerId: string
): Promise<CourtResponse[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    ApiResponse<CourtResponse[]> | CourtResponse[]
  >(`/api/sport-centers/${centerId}/courts`)
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Favorite
// ============================================

export async function addFavoriteSportCenter(
  centerId: string
): Promise<SportCenterFavorite> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<
    ApiResponse<SportCenterFavorite> | SportCenterFavorite
  >("/api/sport-centers/favourites", { centerId })
  return unwrapApiResponse(response.data)
}

export async function removeFavoriteSportCenter(
  centerId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete(
    `/api/sport-centers/favourites/${centerId}`
  )
  return unwrapApiResponse(response.data)
}

export async function getMyFavoriteSportCenters(): Promise<
  SportCenterFavorite[]
> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    ApiResponse<SportCenterFavorite[]> | SportCenterFavorite[]
  >("/api/sport-centers/favorites/me")
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Courts Availability
// ============================================

export async function getCourtAvailability(
  centerId: string,
  courtId: string,
  date: string
): Promise<CourtResponse[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    ApiResponse<CourtResponse[]> | CourtResponse[]
  >(
    `/api/sport-centers/${centerId}/courts/${courtId}/availability?date=${date}`
  )
  return unwrapApiResponse(response.data)
}

export async function getBulkCourtAvailability(
  centerId: string,
  date: string
): Promise<BulkCourtAvailability> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    ApiResponse<BulkCourtAvailability> | BulkCourtAvailability
  >(`/api/sport-centers/${centerId}/availability?date=${date}`)
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Bookings
// ============================================

export async function createBooking(
  centerId: string,
  courtId: string,
  bookingRequest: BookingRequest
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post(
    `/api/sport-centers/${centerId}/courts/${courtId}/bookings`,
    bookingRequest
  )
  return unwrapApiResponse(response.data)
}

export async function getMyBookings(
  status: BookingStatus,
  courtId: string,
  date: string,
  limit: number,
  offset: number
): Promise<Booking[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get(
    `/api/sport-centers/bookings/me?status=${status}&courtId=${courtId}&date=${date}&limit=${limit}&offset=${offset}`
  )
  return unwrapApiResponse(response.data)
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get(`/api/sport-centers/bookings/${bookingId}`)
  return unwrapApiResponse(response.data)
}

export async function cancelBooking(
  bookingId: string,
  cancelReason: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post(
    `/api/sport-centers/bookings/${bookingId}/cancel?cancel_reason=${cancelReason}`
  )
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Reviews
// ============================================

export async function getSportCenterReviews(
  centerId: string
): Promise<Review[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<Review[]> | Review[]>(
    `/api/sport-centers/reviews/center/${centerId}`
  )
  return unwrapApiResponse(response.data)
}

export async function addSportCenterReview(
  centerId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiResponse<Review> | Review>(
    `/api/sport-centers/reviews`,
    { centerId, rating, comment }
  )
  return unwrapApiResponse(response.data)
}

export async function editSportCenterReview(
  reviewId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.put<ApiResponse<Review> | Review>(
    `/api/sport-centers/reviews/${reviewId}`,
    { rating, comment }
  )
  return unwrapApiResponse(response.data)
}

export async function deleteSportCenterReview(reviewId: string): Promise<void> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete(`/api/sport-centers/reviews/${reviewId}`)
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Services
// ============================================

export async function getSportCenterServices(
  centerId: string
): Promise<Service[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<Service[]> | Service[]>(
    `/api/sport-centers/${centerId}/services`
  )
  return unwrapApiResponse(response.data)
}

// ============================================
// Sport Center Products
// ============================================

export async function getSportCenterProducts(
  centerId: string
): Promise<Product[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiResponse<Product[]> | Product[]>(
    `/api/sport-centers/${centerId}/products`
  )
  return unwrapApiResponse(response.data)
}
