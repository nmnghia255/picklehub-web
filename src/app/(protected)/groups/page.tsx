import { ErrorSection } from "@/components/error-section"
import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/groups-page-content"

function getHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null
  }

  const maybeError = error as { response?: { status?: unknown } }
  const status = maybeError.response?.status
  return typeof status === "number" ? status : null
}

export default async function GroupsPage() {
  const [myGroupsResult, discoverGroupsResult] = await Promise.allSettled([
    getMyGroups(),
    listAllGroups({ page: 1, limit: 100 }),
  ])

  const myGroups =
    myGroupsResult.status === "fulfilled" ? myGroupsResult.value : []
  const discoverGroups =
    discoverGroupsResult.status === "fulfilled"
      ? discoverGroupsResult.value.groups
      : []

  const failedRequests = [myGroupsResult, discoverGroupsResult].filter(
    (result) => result.status === "rejected"
  )

  const loadError =
    failedRequests.length > 0
      ? failedRequests.some((result) => {
          const reason = result.status === "rejected" ? result.reason : null
          return getHttpStatus(reason) === 502
        })
        ? "Dịch vụ nhóm tạm thời không phản hồi. Vui lòng thử lại sau."
        : "Không thể tải danh sách nhóm. Vui lòng thử lại sau."
      : null

  return (
    <>
      {loadError ? (
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <ErrorSection message={loadError} />
        </div>
      ) : null}
      <GroupsPageContent myGroups={myGroups} discoverGroups={discoverGroups} />
    </>
  )
}
