import { PageContainer } from "@/components/page-container"
import { getGroupMembers } from "@/features/groups/api/groups-service"
import {
  getGroupPlaySessionDetail,
  listGroupPlaySessionParticipants,
} from "@/features/play-sessions/api/group-play-sessions-service"
import {
  getPublicPlaySessionDetail,
  listPublicPlaySessionParticipants,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"

interface PlaySessionDetailPageProps {
  params: Promise<{ sessionId: string }>
  searchParams?: Promise<{ groupId?: string }>
}

export default async function PlaySessionDetailPage({
  params,
  searchParams,
}: PlaySessionDetailPageProps) {
  const { sessionId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const groupId = resolvedSearchParams?.groupId
  const backHref = groupId ? `/groups/${groupId}` : "/play-sessions"

  let playSession: Awaited<
    ReturnType<typeof getPublicPlaySessionDetail>
  > | null = null
  let participants: Array<{
    userId: string
    joinedAt?: string
    displayName?: string
  }> = []
  let participantsError: string | null = null
  let userNameMap: Record<string, string> = {}

  try {
    if (groupId) {
      const [sessionResult, participantsResult, membersResult] =
        await Promise.allSettled([
          getGroupPlaySessionDetail(groupId, sessionId),
          listGroupPlaySessionParticipants(groupId, sessionId, {
            page: 1,
            limit: 20,
          }),
          getGroupMembers(groupId),
        ])

      if (sessionResult.status === "rejected") {
        throw sessionResult.reason
      }

      playSession = sessionResult.value

      if (participantsResult.status === "fulfilled") {
        participants = participantsResult.value.participants
      } else {
        participantsError = "Không thể tải danh sách người tham gia."
      }

      // Create a mapping of userId to name from group members
      if (membersResult.status === "fulfilled") {
        userNameMap = membersResult.value.reduce(
          (acc, member) => {
            acc[member.userId] = member.name
            return acc
          },
          {} as Record<string, string>
        )
        // Enrich participants with display names
        participants = participants.map((p) => ({
          ...p,
          displayName: userNameMap[p.userId],
        }))
      }
    } else {
      const [sessionResult, participantsResult] = await Promise.allSettled([
        getPublicPlaySessionDetail(sessionId),
        listPublicPlaySessionParticipants(sessionId, { page: 1, limit: 100 }),
      ])

      if (sessionResult.status === "rejected") {
        throw sessionResult.reason
      }

      playSession = sessionResult.value

      if (participantsResult.status === "fulfilled") {
        participants = participantsResult.value.participants
      } else {
        participantsError = "Không thể tải danh sách người tham gia."
      }
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể tải chi tiết buổi chơi."

    return <PlaySessionError message={message} backHref={backHref} />
  }

  if (!playSession) {
    return (
      <PlaySessionError
        message="Không tìm thấy thông tin buổi chơi."
        backHref={backHref}
      />
    )
  }

  return (
    <PageContainer>
      <PlaySessionHeader title={playSession.title} backHref={backHref} />
      <PlaySessionInfo
        session={playSession}
        participantCount={participants.length}
      />
      <PlaySessionParticipants
        participants={participants}
        error={participantsError}
      />
    </PageContainer>
  )
}
