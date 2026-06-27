export interface CreateTournamentBookingResponse {
  booking: CreateBooking
  sportCenter: SportCenter
}

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
  bookingItems: BookingItem[]
  expiresAt: string
}

interface BookingItem {
  id: string
  courtId: string
  startTime: string
  endTime: string
}

export interface TournamentBookingRequest {
  centerId: string
  date: string
  items: BookingItemRequest[]
  playerName: string
  phoneNumber: string
}

interface BookingItemRequest {
  courtId: string
  startTime: string
  endTime: string
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
