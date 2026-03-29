import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { AddGroupDrawer } from "@/features/groups/components/add-group-drawer"
import { GroupTabs } from "@/features/groups/components/group-tabs"

export default async function GroupsPage() {
  const [myGroups, discoverResult] = await Promise.all([
    getMyGroups(),
    listAllGroups({ page: 1, limit: 100 }),
  ])

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhóm</h1>
        <AddGroupDrawer />
      </div>

      <GroupTabs myGroups={myGroups} discoverGroups={discoverResult.groups} />
    </div>
  )
}
