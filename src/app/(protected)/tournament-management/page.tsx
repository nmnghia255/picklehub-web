export const dynamic = "force-dynamic"

import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { TournamentList } from "@/features/tournaments/components/tournament-list"
import type { Tournament } from "@/features/tournaments/types/tournament"

export default async function TournamentPage() {
  let tournaments: Tournament[] = []
  let totalItems = 0
  let totalPages = 1

  try {
    const result = await TournamentService.getMyTournaments("all", 1, 9)
    if (result && Array.isArray(result.data)) {
      tournaments = result.data
      const total = result.meta?.total ?? tournaments.length
      totalItems = total
      totalPages = result.meta?.totalPages ?? Math.ceil(total / 9)
    }
  } catch (error) {
    console.error("Failed to fetch my tournaments from server:", error)
  }

  return (
    <TournamentList
      initialTournaments={tournaments}
      initialTotalItems={totalItems}
      initialTotalPages={totalPages}
      mode="management"
    />
  )
}
