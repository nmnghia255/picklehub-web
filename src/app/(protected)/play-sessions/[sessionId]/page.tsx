import { redirect } from "next/navigation"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  deletePublicPlaySession,
  getPublicPlaySessionDetail,
  joinPlaySession,
  leavePublicPlaySession,
  listPublicPlaySessionParticipants,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"
import { PublicPlaySessionPaymentCard } from "@/features/play-sessions/components/public-play-session-payment-card"
import type { PlaySessionParticipant } from "@/features/play-sessions/types"
import { getSession } from "@/lib/session"

interface PlaySessionDetailPageProps {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ delete?: string }>
}

export default async function PlaySessionDetailPage({
  params,
  searchParams,
}: PlaySessionDetailPageProps) {
  const { sessionId } = await params
  const { delete: deleteStatus } = await searchParams
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
      listPublicPlaySessionParticipants(sessionId),
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
  const myParticipant = participants.find(
    (participant) =>
      normalizeUserId(participant.userId) === normalizeUserId(currentUserId)
  )

  async function toggleParticipationAction() {
    "use server"

    if (!currentUserId) {
      redirect("/login")
    }

    try {
      if (hasJoined) {
        await leavePublicPlaySession(sessionId)
      } else {
        await joinPlaySession(sessionId)
      }

      redirect(detailHref)
    } catch (error) {
      console.error("Error toggling participation:", error)
      redirect(detailHref + "?error=1")
    }
  }

  async function deletePlaySessionAction() {
    "use server"

    try {
      await deletePublicPlaySession(sessionId)
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
        errorMessage="Xoa buoi choi that bai. Vui long thu lai sau."
      />
      <PlaySessionHeader
        title={playSession.title}
        backHref={backHref}
        action={
          <form action={toggleParticipationAction}>
            <Button type="submit" variant={hasJoined ? "outline" : "default"}>
              {hasJoined ? "Rời buổi chơi" : "Tham gia buổi chơi"}
            </Button>
          </form>
        }
      />
      <PlaySessionInfo
        session={playSession}
        participantCount={participants.length}
      />
      <PlaySessionParticipants
        playSessionId={sessionId}
        participants={participants}
        isHost={isCreator}
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
