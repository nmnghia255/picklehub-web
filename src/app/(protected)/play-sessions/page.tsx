import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { listPlaySessions } from "@/features/play-sessions/api/public-play-sessions-service"
import { CreatePlaySessionModal } from "@/features/play-sessions/components/create-play-session-modal"
import { PlaySessionsTabs } from "@/features/play-sessions/components/play-sessions-tabs"
import type { GroupPlaySession } from "@/features/play-sessions/types"

interface SessionsPageProps {
  searchParams: Promise<{ delete?: string }>
}

export default async function SessionsPage({
  searchParams,
}: SessionsPageProps) {
  const { delete: deleteStatus } = await searchParams
  const [
    myParticipantSessionsResult,
    myHostSessionsResult,
    publicSessionsResult,
  ] = await Promise.allSettled([
    listPlaySessions({
      contextType: "PUBLIC_APP",
      isParticipant: true,
      sortBy: "startTime",
      order: "asc",
      page: 1,
      limit: 100,
    }),
    listPlaySessions({
      contextType: "PUBLIC_APP",
      isHost: true,
      sortBy: "startTime",
      order: "asc",
      page: 1,
      limit: 100,
    }),
    listPlaySessions({
      contextType: "PUBLIC_APP",
      sortBy: "startTime",
      order: "asc",
      page: 1,
      limit: 20,
    }),
  ])

  const participantSessions: GroupPlaySession[] =
    myParticipantSessionsResult.status === "fulfilled" &&
    Array.isArray(myParticipantSessionsResult.value.data)
      ? myParticipantSessionsResult.value.data
      : []

  const hostSessions: GroupPlaySession[] =
    myHostSessionsResult.status === "fulfilled" &&
    Array.isArray(myHostSessionsResult.value.data)
      ? myHostSessionsResult.value.data
      : []

  const mySessions: GroupPlaySession[] = Array.from(
    new Map(
      [...hostSessions, ...participantSessions].map((session) => [
        session.id,
        session,
      ])
    ).values()
  )

  const publicSessions: GroupPlaySession[] =
    publicSessionsResult.status === "fulfilled" &&
    Array.isArray(publicSessionsResult.value.data)
      ? publicSessionsResult.value.data.filter(
          (session) => session.type === "PUBLIC_APP"
        )
      : []

  const mySessionsError =
    myParticipantSessionsResult.status === "rejected" &&
    myHostSessionsResult.status === "rejected"
  const publicSessionsError = publicSessionsResult.status === "rejected"

  return (
    <PageContainer>
      <DeleteStatusToast
        status={deleteStatus}
        successMessage="Xóa thành công."
      />

      <div className="mb-6 flex justify-end">
        <CreatePlaySessionModal />
      </div>

      <PlaySessionsTabs
        mySessions={mySessions}
        mySessionsError={mySessionsError}
        publicSessions={publicSessions}
        publicSessionsError={publicSessionsError}
      />
    </PageContainer>
  )
}
