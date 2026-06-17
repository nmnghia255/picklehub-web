import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { TournamentList } from "@/features/tournaments/components/tournament-list"
import { tournaments as mockTournaments } from "@/features/tournaments/mock-data/tournament-list"
import type { Tournament } from "@/features/tournaments/types/tournament"

export default async function TournamentPage() {
  let tournaments: Tournament[] = []

  try {
    const data = await TournamentService.getTournaments("", 1, 100)
    if (data && Array.isArray(data)) {
      tournaments = data
    }
  } catch (error) {
    console.error(
      "Failed to fetch tournaments from server, falling back to mock data:",
      error
    )
  }

  return <TournamentList initialTournaments={tournaments} />
}
