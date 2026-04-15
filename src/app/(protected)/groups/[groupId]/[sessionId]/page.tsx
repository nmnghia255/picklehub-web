import { redirect } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { getGroupMembers } from "@/features/groups/api/groups-service"
import {
  getGroupPlaySessionDetail,
  leaveGroupPlaySession,
  listGroupPlaySessionParticipants,
} from "@/features/play-sessions/api/group-play-sessions-service"
import { JoinPlaySessionDialog } from "@/features/play-sessions/components"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"
import { getSession } from "@/lib/session"

interface PlaySessionDetailPageProps {
  params: Promise<{ groupId: string; sessionId: string }>
}

export default async function GroupPlaySessionDetailPage({
  params,
}: PlaySessionDetailPageProps) {
  const { groupId, sessionId } = await params
  const backHref = `/groups/${groupId}`
  const detailHref = `/groups/${groupId}/${sessionId}`
  const userSession = await getSession()
  const currentUserId = userSession.user?.id

  let playSession: Awaited<
    ReturnType<typeof getGroupPlaySessionDetail>
  > | null = null
  let participants: Array<{
    userId: string
    joinedAt?: string
    displayName?: string
    status?: string
  }> = []
  let participantsError: string | null = null
  let userNameMap: Record<string, string> = {}

  const normalizeUserId = (userId?: string | null) =>
    typeof userId === "string"
      ? userId
          .trim()
          .toLowerCase()
          .replace(/[^a-f0-9]/g, "")
      : ""

  try {
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

  const hasJoined =
    !!normalizeUserId(currentUserId) &&
    participants.some(
      (participant) =>
        normalizeUserId(participant.userId) ===
          normalizeUserId(currentUserId) && participant.status !== "LEFT"
    )

  async function leaveParticipationAction() {
    "use server"

    try {
      await leaveGroupPlaySession(groupId, sessionId)

      redirect(detailHref)
    } catch (error) {
      console.error("Error toggling participation:", error)
      redirect(detailHref)
    }
  }

  return (
    <PageContainer>
      <PlaySessionHeader
        title={playSession.title}
        backHref={backHref}
        action={
          hasJoined ? (
            <form action={leaveParticipationAction}>
              <Button type="submit" variant="outline">
                Rời buổi chơi
              </Button>
            </form>
          ) : (
            <JoinPlaySessionDialog groupId={groupId} sessionId={sessionId} />
          )
        }
      />
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
