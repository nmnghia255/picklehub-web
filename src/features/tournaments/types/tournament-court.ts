export interface TournamentCourt {
  date: string
  centerId: string
  courtCount: number
  courts: CenterCourt[]
}

export interface CenterCourt {
  courtId: string
  courtName: string
  slots: CourtSlot[]
}

export interface CourtSlot {
  startTime: string
  endTime: string
  available: boolean
  pricePerHour: number
  bookingId?: number
  bookingItemId?: string
  id?: string
}

export interface CourtInfo {
  courtId: string
  courtName: string
}
