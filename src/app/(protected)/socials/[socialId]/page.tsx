import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { SocialService } from "@/features/socials/api/social-service"
import SocialDetail from "@/features/socials/components/social-detail/index"
import type { PlaySession } from "@/features/socials/types/play-session"
import type {
  ListSocial as Social,
  SocialDetail as SocialDetailType,
  SocialParticipant,
} from "@/features/socials/types/social"

export default async function Page(props: {
  params: Promise<{ socialId: string }>
}) {
  const params = await props.params
  let participants: SocialParticipant[] = []
  let playSessions: PlaySession[] = []
  let social: SocialDetailType | null = null

  try {
    ;[social, participants, playSessions] = await Promise.all([
      SocialService.getSocial(params.socialId),
      SocialService.listSocialParticipants(params.socialId),
      PlaySessionService.listPlaySessions(params.socialId),
    ])
  } catch (error) {
    console.error("Error fetching social participants:", error)
  }

  return (
    <SocialDetail
      initialSocial={social}
      initialParticipants={participants}
      initialPlaySessions={playSessions}
    />
  )
}
