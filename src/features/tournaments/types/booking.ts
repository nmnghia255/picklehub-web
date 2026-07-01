/** A single element of the array returned by the create-bookings API */
export interface CreateTournamentBookingEntry {
  booking: CreateBooking
  sportCenter: SportCenter
}

/** The API returns an array of booking entries */
export type CreateTournamentBookingResponse = CreateTournamentBookingEntry[]

interface CreateBooking {
  id: string
  tournamentId: string
  externalBookingId: string
  centerId: string
  date: string
  statusMirror: string
  totalPrice: number
  createAt: string
  updateAt: string
}

interface SportCenter {
  id: string
  status: string
  totalPrice: number
  bookingItems: CreateBookingItemResponse[]
  expiresAt: string
}

interface CreateBookingItemResponse {
  id: string
  courtId: string
  startTime: string
  endTime: string
}

export interface BookingItemRequest {
  courtId: string
  startTime: string
  endTime: string
}

interface Bookings {
  date: string
  items: BookingItemRequest[]
}

export interface TournamentBookingRequest {
  centerId: string
  bookings: Bookings[]
  playerName: string
  phoneNumber: string
}

export interface TournamentBooking {
  id: number
  tournamentId: number
  externalBookingId: string
  centerId: string
  date: string | null
  statusMirror: string
  totalPrice: number | null
  createdAt: string
  updatedAt: string
  liveStatus?: string
  items?: Item[]
  fixture?: Fixture[]
}

interface Item {
  id: string
  courtId: string
  startTime: string
  endTime: string
  court: {
    id: string
    name: string
  }
}

interface Fixture {
  id: string
  bookingId: string
  bookingItemId: string
  round: string
}

export interface CancelBookingResponse {
  id: number
  tournamentId: number
  externalBookingId: string
  centerId: string
  date: string
  statusMirror: string
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface BookingItemResponse {
  bookingId: number
  externalBookingId: string
  bookingItemId: string
  date: string
  startTime: string
  endTime: string
  courtId: string
  courtName: string
  status: string
  assignedMatch: string | null
}
