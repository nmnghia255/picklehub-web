export type SwingAnalysisType =
  | "dink"
  | "drive"
  | "volley"
  | "serve"
  | "general"

export type SwingAnalysisLanguage = "vi" | "en"
export type DetectionPriority = "low" | "medium" | "high"

export interface SwingAnalysisRequest {
  imageUrl: string
  analysisType: SwingAnalysisType
  prompt?: string
  language?: SwingAnalysisLanguage
}

export interface SwingDetectionDetails {
  observation: string
  correction: string
  drill: string
  priority: DetectionPriority
  visibilityNote: string
}

export interface SwingDetection {
  label: string
  confidence: number
  details: SwingDetectionDetails
}

export interface SwingAnalysisResult {
  description: string
  detections: SwingDetection[]
  confidence: number
}

export interface SwingTokenUsage {
  input?: number
  output?: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface SwingAnalysisMetadata {
  model?: string
  processingTimeMs?: number
  tokenUsage?: SwingTokenUsage
}

export interface SwingAnalysisApiResponse {
  success: boolean
  data: SwingAnalysisResult | null
  error: unknown
  metadata?: SwingAnalysisMetadata
}
