import type {
  SwingAnalysisApiResponse,
  SwingAnalysisRequest,
  SwingAnalysisResult,
} from "../types/swing-analysis"

const SWING_ANALYSIS_URL = "/api/proxy/ai/analyses/swing"

export class SwingAnalysisError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = "SwingAnalysisError"
  }
}

function getErrorText(error: unknown) {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; error?: unknown }
    if (typeof value.message === "string") return value.message
    if (typeof value.error === "string") return value.error
  }
  return "Swing analysis failed"
}

export const SwingAnalysisService = {
  async analyze(request: SwingAnalysisRequest): Promise<SwingAnalysisResult> {
    let response: Response
    try {
      response = await fetch(SWING_ANALYSIS_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      })
    } catch {
      throw new SwingAnalysisError("Network error")
    }

    const payload = (await response
      .json()
      .catch(() => null)) as SwingAnalysisApiResponse | null
    const message =
      getErrorText(payload?.error) || `Request failed (${response.status})`

    if (!response.ok || !payload?.success || !payload.data) {
      throw new SwingAnalysisError(message, response.status)
    }

    return payload.data
  },
}
