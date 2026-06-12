import { isAxiosError } from "axios"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { MatchService } from "@/features/socials/api/suggested-match-service"
import type { SuggestedMatchRequest } from "@/features/socials/types/match"

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ socialId: string; playSessionId: string }> }
) {
  try {
    const params = await props.params
    const body: SuggestedMatchRequest = await req.json()
    const result = await MatchService.suggestMatches(
      params.socialId,
      params.playSessionId,
      body
    )
    return NextResponse.json(result)
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const status = error.response?.status || 500
      const data = error.response?.data

      if (data) {
        return NextResponse.json(data, { status })
      }
    }

    const message =
      error instanceof Error ? error.message : "Failed to suggest matches"
    return NextResponse.json({ message }, { status: 500 })
  }
}
