import axios from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AiResponseDto,
  ChatCompletionResponseData,
  ChatRequestDto,
  DocumentIngestRequestDto,
  EmbeddingsRequestDto,
  RecommendationRequestDto,
  SearchRequestDto,
  SwingAnalysisRequestDto,
  TrendAnalysisRequestDto,
} from "../types/chat"
import type { RecommendationResponse } from "../types/recommendation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

function getInternalAxios(customToken?: string) {
  const token = customToken || process.env.INTERNAL_SERVICE_TOKEN || ""
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-internal-service-token": token,
    },
  })
}

export const AiService = {
  // --- Authenticated User Endpoints ---

  /**
   * Ask questions about Pickleball rules or equipment guides.
   * Supports streaming (real-time replies) if Accept header is set to text/event-stream on the client.
   */
  chatCompletions: async (
    payload: ChatRequestDto
  ): Promise<AiResponseDto<ChatCompletionResponseData>> => {
    const authenticatedAxios = await getAuthenticatedAxios()
    const response = await authenticatedAxios.post<
      AiResponseDto<ChatCompletionResponseData>
    >("/api/ai/chat/completions", payload)
    return response.data
  },

  /**
   * Analyze Pickleball swing technique from a video or image URL.
   */
  analyzeSwing: async (
    payload: SwingAnalysisRequestDto
  ): Promise<AiResponseDto> => {
    const authenticatedAxios = await getAuthenticatedAxios()
    const response = await authenticatedAxios.post<AiResponseDto>(
      "/api/ai/analyses/swing",
      payload
    )
    return response.data
  },

  /**
   * Get personalized matches, training paths, or tactical suggestions based on the player profile.
   */
  recommend: async (
    payload: RecommendationRequestDto
  ): Promise<AiResponseDto> => {
    const authenticatedAxios = await getAuthenticatedAxios()
    const response = await authenticatedAxios.post<AiResponseDto>(
      "/api/ai/recommendations",
      payload
    )
    return response.data
  },

  // --- Internal Service Endpoints ---

  /**
   * Ingest knowledge documents (rules, regulations, tutorials) into pgvector.
   */
  ingestDocument: async (
    payload: DocumentIngestRequestDto,
    customToken?: string
  ): Promise<AiResponseDto> => {
    const client = getInternalAxios(customToken)
    const response = await client.post<AiResponseDto>(
      "/api/ai/internal/documents",
      payload
    )
    return response.data
  },

  /**
   * Perform similarity searches on rulebooks and equipment data to fetch context for RAG.
   */
  search: async (
    payload: SearchRequestDto,
    customToken?: string
  ): Promise<AiResponseDto> => {
    const client = getInternalAxios(customToken)
    const response = await client.post<AiResponseDto>(
      "/api/ai/internal/search",
      payload
    )
    return response.data
  },

  /**
   * Create 768-dimension vector embeddings from text inputs.
   */
  generateEmbeddings: async (
    payload: EmbeddingsRequestDto,
    customToken?: string
  ): Promise<AiResponseDto> => {
    const client = getInternalAxios(customToken)
    const response = await client.post<AiResponseDto>(
      "/api/ai/internal/embeddings",
      payload
    )
    return response.data
  },

  /**
   * Identify peak hours and user booking patterns on 30-day historical data.
   */
  analyzeTrends: async (
    payload: TrendAnalysisRequestDto,
    customToken?: string
  ): Promise<AiResponseDto> => {
    const client = getInternalAxios(customToken)
    const response = await client.post<AiResponseDto>(
      "/api/ai/internal/analyses/trends",
      payload
    )
    return response.data
  },

  /**
   * Call this endpoint to get a personalized Pickleball training roadmap for the authenticated user.
   * The service automatically aggregates the user's profile (bio, preferred hand, DUPR rating, match statistics) and
   * forwards it to the AI Service, which uses a combination of retrieved tactical documents (RAG) and expert
   * coaching knowledge to generate a structured training plan.
   * Supported categories:
   * training (default) — Personalized training roadmap with skills, drills, step-by-step execution, and coaching tips
   */
  personalizedRecommendations: async (
    category: string,
    limit: number
  ): Promise<RecommendationResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<RecommendationResponse>(
      `/api/users/me/recommendations?category=${category}&limit=${limit}`
    )
    return response.data
  },
}
