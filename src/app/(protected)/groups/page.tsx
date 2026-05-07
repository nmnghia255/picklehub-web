import {
  getMyGroups,
  listAllGroups,
} from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/groups-page-content"

export default async function GroupsPage() {
  let myGroups: Awaited<ReturnType<typeof getMyGroups>> = []
  let discoverGroups: Awaited<ReturnType<typeof listAllGroups>>["groups"] = []
  let myGroupsError = false
  let discoverGroupsError = false

  try {
    myGroups = await getMyGroups()
  } catch {
    myGroupsError = true
  }

  try {
    const discoverResult = await listAllGroups({ page: 1, limit: 100 })
    discoverGroups = discoverResult.groups
  } catch {
    discoverGroupsError = true
  }

  return (
    <GroupsPageContent
      myGroups={myGroups}
      discoverGroups={discoverGroups}
      myGroupsError={myGroupsError}
      discoverGroupsError={discoverGroupsError}
    />
  )
}
