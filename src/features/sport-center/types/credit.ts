interface Center {
  id: string
  name: string
  address: string
  images: string[]
}

interface SimpleCenter {
  id: string
  name: string
}

interface SimpleCourt {
  id: string
  name: string
}

interface BookingItem {
  startTime: string
  endTime: string
  itemPrice: number
  court: SimpleCourt
}

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  creditApplied: number
  paymentRemaining: number
  center: SimpleCenter
  bookingItems: BookingItem[]
}

export interface Transaction {
  id: string
  bookingId: string
  amount: number
  type: string
  description: string
  createdAt: string
  updatedAt: string
  booking: Booking
}

export interface Credit {
  id: string
  playerId: string
  centerId: string
  balance: number
  center: Center
  transactions: Transaction[]
}
