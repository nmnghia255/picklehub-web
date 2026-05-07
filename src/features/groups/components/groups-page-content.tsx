"use client"

import { PageContainer } from "@/components/page-container"
import { GroupTabs } from "@/features/groups/components/group-tabs"
import type { Group } from "@/features/groups/types"

type Props = {
  myGroups: Group[]
  discoverGroups: Group[]
  myGroupsError?: boolean
  discoverGroupsError?: boolean
}

export function GroupsPageContent({
  myGroups,
  discoverGroups,
  myGroupsError = false,
  discoverGroupsError = false,
}: Props) {
  return (
    <PageContainer>
      <GroupTabs
        myGroups={myGroups}
        discoverGroups={discoverGroups}
        myGroupsError={myGroupsError}
        discoverGroupsError={discoverGroupsError}
      />
    </PageContainer>
  )
}
