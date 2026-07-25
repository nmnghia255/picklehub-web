export interface AiMonitoringOverview {
  totalRequests: number
  totalPromptTokens?: number
  promptTokens?: number
  totalCompletionTokens?: number
  completionTokens?: number
  totalTokens: number
  estimatedCostUsd?: number
  totalCostUsd?: number
  averageLatencyMs?: number
  avgLatencyMs?: number
}

export interface AiModelPricing {
  modelName: string
  type: string
  inputPerMillionUsd: number
  outputPerMillionUsd: number
}

export interface AiLogItem {
  id: string
  model?: string
  modelName?: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  embeddingTokens?: number
  estimatedCostUsd: number | string
  latencyMs: number
  statusCode?: number
  isSuccess?: boolean
  createdAt: string
  userId?: string | null
  endpoint?: string
  apiEndpoint?: string
  featureModule?: string
  promptText?: string
  completionText?: string
  errorMessage?: string | null
}

export interface AiLogsPaginatedResponse {
  data: AiLogItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface KnowledgeChunk {
  id: string
  chunkIndex: number
  chunkText: string
}

export interface KnowledgeDocument {
  id: string
  title: string
  category: string
  createdAt: string
  chunks?: KnowledgeChunk[]
  content?: string
}

export interface KnowledgePaginatedResponse {
  data: KnowledgeDocument[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface IngestKnowledgePayload {
  title: string
  category: string
  content: string
  sourceType?: string
  sourceUrl?: string
  language?: string
  contentHash?: string
  metadata?: Record<string, unknown>
}

export interface TestSearchPayload {
  query: string
  topK: number
}

export interface TestSearchResult {
  chunkText: string
  documentTitle: string
  similarity: number
  chunkIndex?: number
  category?: string
  metadata?: Record<string, unknown>
}

export type UserStatus =
  | "PENDING"
  | "ACTIVE"
  | "DEACTIVATED"
  | "PENDING_DELETION"
export type UserRole = "USER" | "ADMIN"
export type UserGender = "MALE" | "FEMALE" | "OTHER"
export type PreferredHand = "RIGHT" | "LEFT"

export interface AdminUser {
  id: string
  email: string
  role: UserRole | string
  status: UserStatus | string
  fullName: string
  avatarUrl?: string | null
  bio?: string | null
  gender?: UserGender | string | null
  selfRating?: number | null
  preferredHand?: PreferredHand | string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  latitude?: number | null
  longitude?: number | null
  dupr?: number | null
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  role?: string
  status?: string
  selfRating?: number | null
  preferredHand?: string | null
  phoneNumber?: string | null
  gender?: string | null
  bio?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  dupr?: number | null
}

export interface UserListParams {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

export interface CoachProfileSummary {
  id: string
  displayName: string
  userId: string
  avatarUrl?: string | null
}

export interface CoachCertification {
  id: string
  coachProfileId: string
  name: string
  issuingOrganization: string
  issuedAt: string
  expiresAt?: string | null
  documentUrl: string
  verificationStatus: VerificationStatus | string
  reviewedByUserId?: string | null
  reviewNote?: string | null
  createdAt: string
  updatedAt: string
  coachProfile?: CoachProfileSummary
}

export interface CoachCertificationsPaginatedResponse {
  data: CoachCertification[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CoachCertListParams {
  verificationStatus?: string
  coachProfileId?: string
  page?: number
  limit?: number
}

export interface ReviewCoachCertPayload {
  verificationStatus: "VERIFIED" | "REJECTED"
  reviewNote?: string
}
