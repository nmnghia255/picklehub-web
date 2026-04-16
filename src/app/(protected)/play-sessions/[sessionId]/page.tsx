import { redirect } from "next/navigation"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  getPublicPlaySessionDetail,
  leavePublicPlaySession,
  listPublicPlaySessionParticipants,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { JoinPlaySessionDialog } from "@/features/play-sessions/components"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"
import type { PlaySessionParticipant } from "@/features/play-sessions/types"
import { getSession } from "@/lib/session"

interface PlaySessionDetailPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function PlaySessionDetailPage({
  params,
}: PlaySessionDetailPageProps) {
  const { sessionId } = await params
  const backHref = "/play-sessions"
  const detailHref = `/play-sessions/${sessionId}`
  const userSession = await getSession()
  const currentUserId = userSession.user?.id

  let playSession: Awaited<
    ReturnType<typeof getPublicPlaySessionDetail>
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
      getPublicPlaySessionDetail(sessionId),
      listPublicPlaySessionParticipants(sessionId, { page: 1, limit: 100 }),
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

  async function leaveParticipationAction() {
    "use server"

    if (!currentUserId) {
      redirect("/login")
    }

    try {
      await leavePublicPlaySession(sessionId)

      redirect(detailHref)
    } catch (error) {
      console.error("Error leaving participation:", error)
      redirect(detailHref + "?error=1")
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
            <JoinPlaySessionDialog sessionId={sessionId} />
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
