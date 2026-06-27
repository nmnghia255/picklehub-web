import { notFound } from "next/navigation"

import { getMyProfile } from "@/features/profile/api/profile-service"
import { TournamentEventService } from "@/features/tournaments/api/events-service"
import { TournamentPrizeService } from "@/features/tournaments/api/prizes-service"
import { TournamentRegistrationService } from "@/features/tournaments/api/registration-service"
import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { EventDetailClient } from "@/features/tournaments/components/tournament-player-side/event-page/event-detail-client"
import type { TournamentPrize } from "@/features/tournaments/types/prize"
import type { RegistrationResponse } from "@/features/tournaments/types/registration"
import type { Tournament } from "@/features/tournaments/types/tournament"
import type { TournamentEvent } from "@/features/tournaments/types/tournament-event"

export default async function TournamentEventDetailPage(props: {
  params: Promise<{ tournamentId: string; eventId: string }>
}) {
  const params = await props.params
  const { tournamentId, eventId } = params

  let tournament: Tournament | null = null
  let event: TournamentEvent | null = null
  let prizes: TournamentPrize[] = []
  let registrations: RegistrationResponse[] = []
  let currentUser = null

  try {
    const [
      tournamentData,
      eventData,
      prizesData,
      registrationsData,
      profileData,
    ] = await Promise.all([
      TournamentService.getTournamentById(tournamentId),
      TournamentEventService.getTournamentEvent(tournamentId, eventId),
      TournamentPrizeService.getAllPrizes(tournamentId).catch(() => []),
      TournamentRegistrationService.listTournamentEventRegistrations(
        tournamentId,
        eventId,
        ""
      ).catch(() => []),
      getMyProfile().catch(() => null),
    ])

    tournament = tournamentData
    event = eventData
    prizes = prizesData || []
    registrations = registrationsData || []
    currentUser = profileData
  } catch (error) {
    console.error("Failed to fetch tournament event detail data:", error)
  }

  if (!tournament || !event || !currentUser) {
    notFound()
  }

  return (
    <EventDetailClient
      tournament={tournament}
      event={event}
      prizes={prizes}
      registrations={registrations}
      currentUser={currentUser}
    />
  )
}
