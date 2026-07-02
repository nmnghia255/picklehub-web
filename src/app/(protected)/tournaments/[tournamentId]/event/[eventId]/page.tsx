import { notFound } from "next/navigation"

import { getMyProfile } from "@/features/profile/api/profile-service"
import { TournamentEventService } from "@/features/tournaments/api/events-service"
import { TournamentPrizeService } from "@/features/tournaments/api/prizes-service"
import { TournamentRegistrationService } from "@/features/tournaments/api/registration-service"
import { TournamentScheduleService } from "@/features/tournaments/api/schedule-service"
import { TournamentTeamService } from "@/features/tournaments/api/teams-service"
import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { EventDetailClient } from "@/features/tournaments/components/tournament-player-side/event-page/event-detail-client"
import type { Match } from "@/features/tournaments/types/match"
import type { Team } from "@/features/tournaments/types/player"
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
  let fixtures: Match[] = []
  let teams: Team[] = []

  try {
    const [
      tournamentData,
      eventData,
      prizesData,
      registrationsData,
      profileData,
      fixturesData,
      teamsData,
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
      TournamentScheduleService.getTournamentFixtures(
        Number(tournamentId)
      ).catch(() => []),
      TournamentTeamService.getTeamEvents(eventId, tournamentId).catch(
        () => []
      ),
    ])

    tournament = tournamentData
    event = eventData
    prizes = prizesData || []
    registrations = registrationsData || []
    currentUser = profileData
    fixtures = (fixturesData || []) as unknown as Match[]
    teams = teamsData || []
  } catch (error) {
    console.error("Failed to fetch tournament event detail data:", error)
  }

  if (!tournament || !event || !currentUser) {
    notFound()
  }

  return (
    <div className="tournament-player-root flex flex-1 flex-col">
      <EventDetailClient
        tournament={tournament}
        event={event}
        prizes={prizes}
        registrations={registrations}
        currentUser={currentUser}
        initialMatches={fixtures}
        initialTeams={teams}
      />
    </div>
  )
}
