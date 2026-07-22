export interface SportCenterAISuggestedPriceSlots {
  startTime: string
  endTime: string
  pricePerHour: number
}

export interface SportCenterAIData {
  trendAnalysis: string
  recommendations: string[]
  suggestedPriceSlots: SportCenterAISuggestedPriceSlots[]
}

export interface SportCenterAIResponse {
  success: boolean
  data: SportCenterAIData
  error: string | null
  metadata: {
    model: string
    processingTimeMs: number
  }
}
