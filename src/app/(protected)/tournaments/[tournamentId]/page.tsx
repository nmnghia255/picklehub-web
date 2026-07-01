import { notFound } from "next/navigation"

import { TournamentEventService } from "@/features/tournaments/api/events-service"
import { TournamentRegistrationService } from "@/features/tournaments/api/registration-service"
import { TournamentSponsorService } from "@/features/tournaments/api/sponsor-service"
import { TournamentService } from "@/features/tournaments/api/tournaments-service"
import { PlayerTournament } from "@/features/tournaments/components/tournament-player-side/player-tournament"
import type { Player } from "@/features/tournaments/types/player"
import type { Sponsor } from "@/features/tournaments/types/sponsor"
import type { Tournament } from "@/features/tournaments/types/tournament"
import type { TournamentEvent } from "@/features/tournaments/types/tournament-event"

export default async function TournamentDetailPage(props: {
  params: Promise<{ tournamentId: string }>
}) {
  const params = await props.params
  const { tournamentId } = params

  let tournament: Tournament | null = null
  let events: TournamentEvent[] = []
  let sponsors: Sponsor[] = []
  let participants: Player[] = []

  try {
    const [tournamentData, eventsData, sponsorsData, registrationsData] =
      await Promise.all([
        TournamentService.getTournamentById(tournamentId),
        TournamentEventService.getTournamentEvents(tournamentId).catch(
          () => []
        ),
        TournamentSponsorService.getSponsors(tournamentId).catch(() => []),
        TournamentRegistrationService.listTournamentEventRegistrations(
          tournamentId,
          "",
          "approved"
        ).catch(() => []),
      ])

    tournament = tournamentData
    events = eventsData || []
    sponsors = sponsorsData || []

    if (registrationsData && Array.isArray(registrationsData)) {
      participants = registrationsData.flatMap((reg) => {
        const list: Player[] = []
        if (reg.player) {
          list.push({
            name: reg.player.name,
            rating: reg.player.rating || 0.0,
            avatar:
              reg.player.avatar ||
              reg.player.name.substring(0, 2).toUpperCase(),
            event: reg.event,
          })
        }
        if (reg.partner) {
          list.push({
            name: reg.partner.name,
            rating: reg.partner.rating || 0.0,
            avatar:
              reg.partner.avatar ||
              reg.partner.name.substring(0, 2).toUpperCase(),
            event: reg.event,
          })
        }
        return list
      })
    }
  } catch (error) {
    console.error("Failed to fetch player tournament detail data:", error)
  }

  if (!tournament) {
    notFound()
  }

  return (
    <div className="tournament-player-root flex flex-1 flex-col">
      <PlayerTournament
        tournament={tournament}
        events={events}
        sponsors={sponsors}
        participants={participants}
      />
    </div>
  )
}
