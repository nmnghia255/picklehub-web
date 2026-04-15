import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/groups-page-content"

export default async function GroupsPage() {
  const [myGroups, discoverResult] = await Promise.all([
    getMyGroups(),
    listAllGroups({ page: 1, limit: 100 }),
  ])

  return (
    <GroupsPageContent
      myGroups={myGroups}
      discoverGroups={discoverResult.groups}
    />
  )
}
