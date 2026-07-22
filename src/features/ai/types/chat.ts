export interface ChatMessageDto {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequestDto {
  message: string
  conversationHistory?: ChatMessageDto[]
  context?: string
}

export interface TokenUsageDto {
  input: number
  output: number
}

export interface AiResponseMetadataDto {
  model: string
  processingTimeMs: number
  tokenUsage?: TokenUsageDto
}

export interface ChatCompletionResponseData {
  reply: string
  sources?: string[]
}

export interface AiResponseDto<T = unknown> {
  success: boolean
  data: T | null
  error?: unknown
  metadata?: AiResponseMetadataDto
}

export interface DocumentIngestRequestDto {
  title: string
  category: "rules" | "equipment" | "tactics" | "faq"
  sourceType: "usap" | "ppa" | "custom"
  sourceUrl?: string
  content: string
  language?: "vi" | "en"
  contentHash?: string
  metadata?: Record<string, unknown>
}

export interface SearchRequestDto {
  query: string
  filters?: Record<string, unknown>
  topK?: number
}

export interface EmbeddingsRequestDto {
  texts: string[]
}

export interface TrendAnalysisRequestDto {
  content: string
  contentType:
    | "booking_trends"
    | "usage_patterns"
    | "revenue_analysis"
    | "general"
  maxLength?: number
  language?: "vi" | "en"
}

export interface SwingAnalysisRequestDto {
  imageUrl: string
  analysisType: "dink" | "drive" | "volley" | "serve" | "general"
  prompt?: string
}

export interface RecommendationRequestDto {
  userId: string
  category: "opponent" | "court" | "tournament" | "training"
  userProfile: Record<string, unknown>
  limit?: number
}

// Backward compatibility types
export type conversationHistory = ChatMessageDto
export type ChatRequest = ChatRequestDto
export type ChatResponse = AiResponseDto
