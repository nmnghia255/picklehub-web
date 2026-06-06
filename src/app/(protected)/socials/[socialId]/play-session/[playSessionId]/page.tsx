import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { SocialService } from "@/features/socials/api/social-service"
import PlaySessionDetail from "@/features/socials/components/play-session"
import type {
  PlaySession,
  PlaySessionParticipant,
} from "@/features/socials/types/play-session"
import type { SocialDetail } from "@/features/socials/types/social"

export default async function Page(props: {
  params: Promise<{ socialId: string; playSessionId: string }>
}) {
  const params = await props.params

  let social: SocialDetail | null = null
  let session: PlaySession | null = null
  let participants: PlaySessionParticipant[] = []

  try {
    const [fetchedSocial, fetchedSession, fetchedParticipants] =
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
      ])
    social = fetchedSocial
    session = fetchedSession
    participants = fetchedParticipants
  } catch (error) {
    console.error("Error fetching play session details:", error)
  }

  return (
    <PlaySessionDetail
      initialSocial={social}
      initialSession={session}
      initialParticipants={participants}
    />
  )
}
