import type { RecommendationResponse } from "../types/recommendation"

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
}
