export interface PriceSlot {
  id: string
  centerId: string
  startTime: string
  endTime: string
  pricePerHour: number
  createdAt: string
  updatedAt: string
}

export interface AddPriceSlotRequest {
  startTime: string
  endTime: string
  pricePerHour: number
}

export interface UpdatePriceSlotRequest {
  priceSlots: {
    startTime: string
    endTime: string
    pricePerHour: number
  }[]
}
