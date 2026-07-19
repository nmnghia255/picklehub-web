import axios from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AiResponseDto,
  ChatCompletionResponseData,
  ChatRequestDto,
  RecommendationRequestDto,
  SwingAnalysisRequestDto,
} from "../types/chat"
import type { RecommendationResponse } from "../types/recommendation"
import type { SportCenterAIResponse } from "../types/sport-center-analysis"

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

  // Aggregates 30-day booking data for a sport center and retrieves AI-powered trend analysis and dynamic pricing suggestions.
  getAiForCenter: async (
    centerId: string,
    language: string // vi or en
  ): Promise<SportCenterAIResponse> => {
    const authenticatedAxios = await getAuthenticatedAxios()
    const response = await authenticatedAxios.get<SportCenterAIResponse>(
      `/api/sport-centers/owner/dashboard/overview/${centerId}/trends?language=${language}`
    )
    return response.data
  },
}
