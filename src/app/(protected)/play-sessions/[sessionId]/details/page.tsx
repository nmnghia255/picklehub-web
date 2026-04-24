import { redirect } from "next/navigation"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  deletePublicPlaySession,
  joinPlaySession,
  leavePublicPlaySession,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionInfo } from "@/features/play-sessions/components/play-session-info"
import { PlaySessionRouteTabs } from "@/features/play-sessions/components/play-session-route-tabs"

import { getPlaySessionViewData } from "../_data"

interface PlaySessionDetailsPageProps {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ delete?: string }>
}

export default async function PlaySessionDetailsPage({
  params,
  searchParams,
}: PlaySessionDetailsPageProps) {
  const { sessionId } = await params
  const { delete: deleteStatus } = await searchParams
  const backHref = "/play-sessions"
  const detailsHref = `/play-sessions/${sessionId}/details`

  let viewData: Awaited<ReturnType<typeof getPlaySessionViewData>>

  try {
    viewData = await getPlaySessionViewData(sessionId)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể tải chi tiết buổi chơi."

    return <PlaySessionError message={message} backHref={backHref} />
  }

  const {
    playSession,
    participants,
    guests,
    isCreator,
    hasJoined,
    currentUserId,
  } = viewData

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

      redirect(detailsHref)
    } catch (error) {
      console.error("Error toggling participation:", error)
      redirect(detailsHref + "?error=1")
    }
  }

  async function deletePlaySessionAction() {
    "use server"

    try {
      await deletePublicPlaySession(sessionId)
    } catch (error) {
      console.error("Error deleting play session:", error)
      redirect(detailsHref + "?delete=error")
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

      <PlaySessionRouteTabs sessionId={sessionId} activeTab="details" />

      <PlaySessionInfo
        session={playSession}
        participantCount={
          participants.length +
          guests.filter(
            (guest) => String(guest.status ?? "").toUpperCase() === "CONFIRMED"
          ).length
        }
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
