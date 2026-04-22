import { redirect } from "next/navigation"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  deleteGroupPlaySession,
  getGroupPlaySessionDetail,
  leaveGroupPlaySession,
  listGroupPlaySessionParticipants,
} from "@/features/play-sessions/api/group-play-sessions-service"
import { JoinPlaySessionDialog } from "@/features/play-sessions/components"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"
import type { PlaySessionParticipant } from "@/features/play-sessions/types"
import { getSession } from "@/lib/session"

interface PlaySessionDetailPageProps {
  params: Promise<{ groupId: string; sessionId: string }>
  searchParams: Promise<{ delete?: string }>
}

export default async function GroupPlaySessionDetailPage({
  params,
  searchParams,
}: PlaySessionDetailPageProps) {
  const { groupId, sessionId } = await params
  const { delete: deleteStatus } = await searchParams
  const backHref = `/groups/${groupId}`
  const detailHref = `/groups/${groupId}/${sessionId}`
  const userSession = await getSession()
  const currentUserId = userSession.user?.id

  let playSession: Awaited<
    ReturnType<typeof getGroupPlaySessionDetail>
  > | null = null
  let participants: PlaySessionParticipant[] = []
  let participantsError: string | null = null

  const normalizeUserId = (userId?: string | null) =>
    typeof userId === "string"
      ? userId
          .trim()
          .toLowerCase()
          .replace(/[^a-f0-9]/g, "")
      : ""

  try {
    const [sessionResult, participantsResult] = await Promise.allSettled([
      getGroupPlaySessionDetail(groupId, sessionId),
      listGroupPlaySessionParticipants(groupId, sessionId),
    ])

    if (sessionResult.status === "rejected") {
      throw sessionResult.reason
    }

    playSession = sessionResult.value

    if (participantsResult.status === "fulfilled") {
      participants = participantsResult.value.data
    } else {
      participantsError = "Không thể tải danh sách người tham gia."
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
  const isCreator =
    !!normalizeUserId(currentUserId) &&
    normalizeUserId(currentUserId) === normalizeUserId(playSession.creatorId)

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

  async function deletePlaySessionAction() {
    "use server"

    try {
      await deleteGroupPlaySession(groupId, sessionId)
    } catch (error) {
      console.error("Error deleting play session:", error)
      redirect(detailHref + "?delete=error")
    }

    redirect(backHref + "?delete=success")
  }

  return (
    <PageContainer>
      <DeleteStatusToast
        status={deleteStatus}
        errorMessage="Xóa buổi chơi thất bại. Vui lòng thử lại sau."
      />
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
        playSessionId={sessionId}
        groupId={groupId}
        participants={participants}
        error={participantsError}
      />
      {isCreator ? (
        <div className="mt-4 flex justify-end">
          <form action={deletePlaySessionAction}>
            <Button type="submit" variant="destructive">
              Xóa buổi chơi
            </Button>
          </form>
        </div>
      ) : null}
    </PageContainer>
  )
}
