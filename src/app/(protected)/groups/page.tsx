export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"

import { getMyGroups } from "@/features/groups/api/groups-service"
import { GroupsPageContent } from "@/features/groups/components/dashboard/groups-page-content"

export default async function GroupsPage() {
  let myGroups: Awaited<ReturnType<typeof getMyGroups>> = []
  let myGroupsError = false

  try {
    myGroups = await getMyGroups()
  } catch (err) {
    if (err instanceof Error && err.message === "Session expired") {
      redirect("/api/auth/logout")
    }
    myGroupsError = true
  }

  return <GroupsPageContent myGroups={myGroups} myGroupsError={myGroupsError} />
}
