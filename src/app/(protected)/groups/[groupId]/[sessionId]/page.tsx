import { redirect } from "next/navigation"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  deleteGroupPlaySession,
  getGroupPlaySessionDetail,
  leaveGroupPlaySession,
  listGroupPlaySessionGuests,
  listGroupPlaySessionParticipants,
} from "@/features/play-sessions/api/group-play-sessions-service"
import { JoinPlaySessionDialog } from "@/features/play-sessions/components"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionParticipants } from "@/features/play-sessions/components/play-session-participants"
import type {
  PlaySessionGuest,
  PlaySessionParticipant,
} from "@/features/play-sessions/types"
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
  let guests: PlaySessionGuest[] = []
  let participantsError: string | null = null
  let guestsError: string | null = null

  const normalizeUserId = (userId?: string | null) =>
    typeof userId === "string"
      ? userId
          .trim()
          .toLowerCase()
          .replace(/[^a-f0-9]/g, "")
      : ""

  try {
    const [sessionResult, participantsResult, guestsResult] =
      await Promise.allSettled([
        getGroupPlaySessionDetail(groupId, sessionId),
        listGroupPlaySessionParticipants(groupId, sessionId),
        listGroupPlaySessionGuests(groupId, sessionId, { status: "ALL" }),
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

    if (guestsResult.status === "fulfilled") {
      guests = guestsResult.value.data
    } else {
      guestsError = "Không thể tải danh sách guest."
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

  const normalizedMaxSlots = (() => {
    const raw = playSession.maxSlots as unknown
    if (typeof raw === "string") {
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    }

    if (typeof raw === "number") {
      return Number.isFinite(raw) ? raw : null
    }

    return null
  })()

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
        participantCount={
          participants.length +
          guests.filter(
            (guest) => String(guest.status ?? "").toUpperCase() === "CONFIRMED"
          ).length
        }
      />
      <PlaySessionParticipants
        maxSlots={normalizedMaxSlots}
        playSessionId={sessionId}
        groupId={groupId}
        participants={participants}
        guests={guests}
        currentUserId={currentUserId}
        isHost={isCreator}
        error={participantsError}
        guestsError={guestsError}
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
