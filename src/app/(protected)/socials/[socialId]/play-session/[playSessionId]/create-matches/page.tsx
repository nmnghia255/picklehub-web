import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { MatchesCreationContent } from "@/features/socials/components/matches"
import type { Player } from "@/features/socials/types/match"

export default async function MatchesCreationPage(props: {
  params: Promise<{ socialId: string; playSessionId: string }>
}) {
  const params = await props.params

  let players: Player[] = []

  try {
    const participants = await PlaySessionService.listPlaySessionParticipants(
      params.socialId,
      params.playSessionId
    )

    players = participants
      .filter((p) => p.status === "CONFIRMED")
      .map((p) => ({
        id: p.id,
        name: p.user?.name || "Unknown Player",
        avatarUrl: p.user?.avatarUrl,
        skillLevel: p.skillLevel ?? undefined,
      }))
  } catch (error) {
    console.error("Failed to fetch participants for matches creation:", error)
  }

  return <MatchesCreationContent initialPlayers={players} />
}
