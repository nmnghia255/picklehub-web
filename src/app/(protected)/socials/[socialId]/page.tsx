import { PlaySessionService } from "@/features/socials/api/play-session-service"
import { SocialService } from "@/features/socials/api/social-service"
import SocialDetail from "@/features/socials/components/social-detail/index"
import type { PlaySession } from "@/features/socials/types/play-session"
import type {
  ListSocial as Social,
  SocialDetail as SocialDetailType,
  SocialParticipant,
} from "@/features/socials/types/social"
import { isActiveSocialParticipantStatus } from "@/features/socials/utils"

export default async function Page(props: {
  params: Promise<{ socialId: string }>
  searchParams?: Promise<{
    inviteCode?: string
    inv?: string
    invitationId?: string
  }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  let participants: SocialParticipant[] = []
  let playSessions: PlaySession[] = []
  let social: SocialDetailType | null = null

  try {
    ;[social, participants, playSessions] = await Promise.all([
      SocialService.getSocial(params.socialId),
      SocialService.listSocialParticipants(params.socialId),
      PlaySessionService.listPlaySessions(params.socialId),
    ])

    if (Array.isArray(playSessions) && playSessions.length > 0) {
      playSessions = await Promise.all(
        playSessions.map(async (sess) => {
          try {
            const sessParts =
              await PlaySessionService.listPlaySessionParticipants(
                params.socialId,
                sess.id
              )
            const activeCount = sessParts.filter((p) =>
              isActiveSocialParticipantStatus(p.status)
            ).length
            return {
              ...sess,
              participants: sessParts,
              joinedCount: activeCount > 0 ? activeCount : sess.joinedCount,
            }
          } catch {
            return sess
          }
        })
      )
    }
  } catch (error) {
    console.error("Error fetching social participants:", error)
  }

  return (
    <SocialDetail
      initialSocial={social}
      initialParticipants={participants}
      initialPlaySessions={playSessions}
      inviteCode={searchParams?.inviteCode || searchParams?.inv}
      invitationId={searchParams?.invitationId}
    />
  )
}
