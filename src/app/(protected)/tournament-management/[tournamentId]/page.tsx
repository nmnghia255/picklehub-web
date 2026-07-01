import { notFound } from "next/navigation"

import { TournamentEventService } from "@/features/tournaments/api/events-service"
import { TournamentPrizeService } from "@/features/tournaments/api/prizes-service"
import { TournamentRegistrationService } from "@/features/tournaments/api/registration-service"
import { TournamentSponsorService } from "@/features/tournaments/api/sponsor-service"
import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { TournamentManager } from "@/features/tournaments/components/tournament-manager"
import type { TournamentPrize } from "@/features/tournaments/types/prize"
import type { RegistrationResponse } from "@/features/tournaments/types/registration"
import type { Sponsor } from "@/features/tournaments/types/sponsor"
import type { Tournament } from "@/features/tournaments/types/tournament"
import type { TournamentEvent } from "@/features/tournaments/types/tournament-event"
import { getSession } from "@/lib/session"

export default async function TournamentDetailPage(props: {
  params: Promise<{ tournamentId: string }>
}) {
  const params = await props.params
  const { tournamentId } = params

  let tournament: Tournament | null = null
  let events: TournamentEvent[] = []
  let prizes: TournamentPrize[] = []
  let sponsors: Sponsor[] = []
  let registrations: RegistrationResponse[] = []
  let isHost = false

  try {
    const session = await getSession()
    const [
      tournamentData,
      eventsData,
      prizesData,
      sponsorsData,
      registrationsData,
    ] = await Promise.all([
      TournamentService.getTournamentById(tournamentId),
      TournamentEventService.getTournamentEvents(tournamentId),
      TournamentPrizeService.getAllPrizes(tournamentId),
      TournamentSponsorService.getSponsors(tournamentId).catch(() => []),
      TournamentRegistrationService.listTournamentEventRegistrations(
        tournamentId,
        "",
        ""
      ).catch(() => []),
    ])

    tournament = tournamentData
    events = eventsData || []
    prizes = prizesData || []
    sponsors = sponsorsData || []
    registrations = registrationsData || []

    isHost =
      session?.user?.id !== undefined &&
      tournament?.organizerId !== undefined &&
      String(session.user.id) === String(tournament.organizerId)
  } catch (error) {
    console.error("Failed to fetch tournament detail data:", error)
  }

  if (!tournament) {
    notFound()
  }

  return (
    <div className="tournament-management-root flex flex-1 flex-col">
      <TournamentManager
        tournament={tournament}
        events={events}
        prizes={prizes}
        sponsors={sponsors}
        registrations={registrations}
        isHost={isHost}
      />
    </div>
  )
}
