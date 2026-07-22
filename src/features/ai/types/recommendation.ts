export interface RecommendationSkill {
  tacticName: string
  coreConcept: string
  whyHelpful: string
  executionSteps: string[]
  proTip: string
}

export interface RecommendationData {
  trainingPath: string
  skills: RecommendationSkill[]
}

export interface RecommendationResponse {
  success: boolean
  data: RecommendationData
  error: string | null
  metadata: {
    model: string
    processingTimeMs: number
  }
}
