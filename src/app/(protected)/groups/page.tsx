import { ErrorSection } from "@/components/error-section"
import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/groups-page-content"

export default async function GroupsPage() {
  let myGroups
  let discoverResult

  try {
    ;[myGroups, discoverResult] = await Promise.all([
      getMyGroups(),
      listAllGroups({ page: 1, limit: 100 }),
    ])
  } catch (error) {
    console.error("Error loading groups:", error)
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <ErrorSection message="Đã xảy ra lỗi khi tải danh sách nhóm. Vui lòng thử lại sau." />
      </div>
    )
  }

  return (
    <GroupsPageContent
      myGroups={myGroups}
      discoverGroups={discoverResult.groups}
    />
  )
}
