import { AlertCircle } from "lucide-react"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { PageContainer } from "@/components/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  getMyPlaySessions,
  listPlaySessions,
} from "@/features/play-sessions/api/public-play-sessions-service"
import { PlaySessionsTabs } from "@/features/play-sessions/components/play-sessions-tabs"
import type { GroupPlaySession } from "@/features/play-sessions/types"

interface SessionsPageProps {
  searchParams: Promise<{ delete?: string }>
}

export default async function SessionsPage({
  searchParams,
}: SessionsPageProps) {
  const { delete: deleteStatus } = await searchParams
  const [mySessionsResult, publicSessionsResult] = await Promise.allSettled([
    getMyPlaySessions({
      period: "month",
    }),
    listPlaySessions({
      contextType: "PUBLIC_APP",
      sortBy: "startTime",
      order: "asc",
      page: 1,
      limit: 20,
    }),
  ])

  const mySessions: GroupPlaySession[] =
    mySessionsResult.status === "fulfilled" &&
    Array.isArray(mySessionsResult.value)
      ? mySessionsResult.value
      : []
  const publicSessions: GroupPlaySession[] =
    publicSessionsResult.status === "fulfilled" &&
    Array.isArray(publicSessionsResult.value.data)
      ? publicSessionsResult.value.data
      : []

  const errorMessage =
    mySessionsResult.status === "rejected" ||
    publicSessionsResult.status === "rejected"
      ? "Không thể tải dữ liệu. Vui lòng thử lại sau."
      : null

  return (
    <PageContainer>
      <DeleteStatusToast
        status={deleteStatus}
        successMessage="Xoa buoi choi thanh cong."
      />
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Đã có lỗi xảy ra</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <PlaySessionsTabs
        mySessions={mySessions}
        publicSessions={publicSessions}
      />
    </PageContainer>
  )
}
