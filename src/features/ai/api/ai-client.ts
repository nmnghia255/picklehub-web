import type { RecommendationResponse } from "../types/recommendation"
import type { SportCenterAIResponse } from "../types/sport-center-analysis"

const PROXY_BASE = "/api/proxy"

export const AiClient = {
  getPersonalizedRecommendations: async (
    category: string,
    limit: number
  ): Promise<RecommendationResponse> => {
    const url = `${PROXY_BASE}/users/me/recommendations?category=${category}&limit=${limit}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message =
        payload.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }
    return response.json()
  },

  getAiForCenter: async (
    centerId: string,
    language: string
  ): Promise<SportCenterAIResponse> => {
    const url = `${PROXY_BASE}/sport-centers/owner/dashboard/overview/${centerId}/trends?language=${language}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message =
        payload.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }
    return response.json()
  },
}
