// app/(main)/play-sessions/[sessionId]/matches/page.tsx (updated)
import { redirect } from "next/navigation"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import {
  deletePublicPlaySession,
  joinPlaySession,
  leavePublicPlaySession,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { MatchesList } from "@/features/play-sessions/components/matches-list"
import { PlaySessionError } from "@/features/play-sessions/components/play-session-error"
import { PlaySessionHeader } from "@/features/play-sessions/components/play-session-header"
import { PlaySessionRouteTabs } from "@/features/play-sessions/components/play-session-route-tabs"

import { getPlaySessionViewData } from "../_data"

interface PlaySessionMatchesPageProps {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ delete?: string }>
}

export default async function PlaySessionMatchesPage({
  params,
  searchParams,
}: PlaySessionMatchesPageProps) {
  const { sessionId } = await params
  const { delete: deleteStatus } = await searchParams
  const backHref = "/play-sessions"
  const matchesHref = `/play-sessions/${sessionId}/matches`

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

  const { playSession, currentUserId, isCreator, hasJoined, participants } =
    viewData

  async function toggleParticipationAction() {
    "use server"
    if (!currentUserId) redirect("/login")
    try {
      if (hasJoined) {
        await leavePublicPlaySession(sessionId)
      } else {
        await joinPlaySession(sessionId)
      }
      redirect(matchesHref)
    } catch (error) {
      console.error("Error toggling participation:", error)
      redirect(matchesHref + "?error=1")
    }
  }

  async function deletePlaySessionAction() {
    "use server"
    try {
      await deletePublicPlaySession(sessionId)
    } catch (error) {
      console.error("Error deleting play session:", error)
      redirect(matchesHref + "?delete=error")
    }
    redirect(backHref + "?delete=success")
  }

  // Extract confirmed players for the matches list
  const confirmedPlayers = participants
    .filter((p) => String(p.status ?? "").toUpperCase() === "CONFIRMED")
    .map((p) => ({ id: p.userId, name: p.name ?? p.userId }))

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
          <form action={toggleParticipationAction}>
            <Button type="submit" variant={hasJoined ? "outline" : "default"}>
              {hasJoined ? "Rời buổi chơi" : "Tham gia buổi chơi"}
            </Button>
          </form>
        }
      />

      <PlaySessionRouteTabs sessionId={sessionId} activeTab="matches" />

      <MatchesList sessionId={sessionId} players={confirmedPlayers} />

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
