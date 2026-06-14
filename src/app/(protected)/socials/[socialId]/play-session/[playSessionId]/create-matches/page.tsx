import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { MatchesCreationContent } from "@/features/socials/components/matches"
import type { Player } from "@/features/socials/types/match"

export default async function MatchesCreationPage(props: {
  params: Promise<{ socialId: string; playSessionId: string }>
}) {
  const params = await props.params

  let players: Player[] = []
  let numberOfCourts = 0

  try {
    const [participants, playSession] = await Promise.all([
      PlaySessionService.listPlaySessionParticipants(
        params.socialId,
        params.playSessionId
      ),
      PlaySessionService.getPlaySession(params.socialId, params.playSessionId),
    ])

    players = participants
      .filter((p) => p.status === "CONFIRMED")
      .map((p) => ({
        id: p.id,
        name: p.user?.name || "Unknown Player",
        avatarUrl: p.user?.avatarUrl,
        skillLevel: p.skillLevel ?? undefined,
      }))

    numberOfCourts = playSession?.numberOfCourts || 0
  } catch (error) {
    console.error("Failed to fetch data for matches creation:", error)
  }

  return (
    <MatchesCreationContent
      initialPlayers={players}
      numberOfCourts={numberOfCourts}
    />
  )
}
