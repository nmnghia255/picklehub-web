import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { SocialService } from "@/features/socials/api/social-service"
import { MatchService } from "@/features/socials/api/suggested-match-service"
import PlaySessionDetail from "@/features/socials/components/play-session"
import type { PlaySessionMatch } from "@/features/socials/types/match"
import type {
  PlaySession,
  PlaySessionParticipant,
} from "@/features/socials/types/play-session"

export default async function Page(props: {
  params: Promise<{ socialId: string; playSessionId: string }>
}) {
  const params = await props.params

  let session: PlaySession | null = null
  let participants: PlaySessionParticipant[] = []
  let matches: PlaySessionMatch[] = []

  try {
    const [fetchedSocial, fetchedSession, fetchedParticipants, fetchedMatches] =
      await Promise.all([
        SocialService.getSocial(params.socialId),
        PlaySessionService.getPlaySession(
          params.socialId,
          params.playSessionId
        ),
        PlaySessionService.listPlaySessionParticipants(
          params.socialId,
          params.playSessionId
        ),
        MatchService.listMatches({
          playSessionId: params.playSessionId,
          page: 1,
          limit: 100,
        })
          .then((res) => res.items)
          .catch(() => [] as PlaySessionMatch[]),
      ])
    session = fetchedSession
    participants = fetchedParticipants
    matches = fetchedMatches
  } catch (error) {
    console.error("Error fetching play session details:", error)
  }

  return (
    <PlaySessionDetail
      initialSession={session}
      initialParticipants={participants}
      initialMatches={matches}
    />
  )
}
