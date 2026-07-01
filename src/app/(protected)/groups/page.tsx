export const dynamic = "force-dynamic"

import { getMyGroups } from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/groups-page-content"

export default async function GroupsPage() {
  let myGroups: Awaited<ReturnType<typeof getMyGroups>> = []
  let myGroupsError = false

  try {
    myGroups = await getMyGroups()
  } catch {
    myGroupsError = true
  }

  return <GroupsPageContent myGroups={myGroups} myGroupsError={myGroupsError} />
}
