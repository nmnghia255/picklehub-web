import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { AddGroupDrawer } from "@/features/groups/components/add-group-drawer"
import { GroupTabs } from "@/features/groups/components/group-tabs"

export default async function GroupsPage() {
  const [myGroupsResult, discoverResult] = await Promise.allSettled([
    getMyGroups(),
    listAllGroups({ page: 1, limit: 100 }),
  ])

  if (myGroupsResult.status === "rejected") {
    console.error(
      "Khong the tai danh sach nhom cua ban:",
      myGroupsResult.reason
    )
  }

  if (discoverResult.status === "rejected") {
    console.error(
      "Khong the tai danh sach nhom kham pha:",
      discoverResult.reason
    )
  }

  const myGroups =
    myGroupsResult.status === "fulfilled" ? myGroupsResult.value : []
  const discoverGroups =
    discoverResult.status === "fulfilled" ? discoverResult.value.groups : []

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhóm</h1>
        <AddGroupDrawer />
      </div>

      <GroupTabs myGroups={myGroups} discoverGroups={discoverGroups} />
    </div>
  )
}
