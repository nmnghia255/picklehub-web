"use client"

import { PageContainer } from "@/components/page-container"
import { GroupTabs } from "@/features/groups/components/group-tabs"
import type { Group } from "@/features/groups/types"

type Props = {
  myGroups: Group[]
  discoverGroups: Group[]
}

export function GroupsPageContent({ myGroups, discoverGroups }: Props) {
  return (
    <PageContainer>
      <GroupTabs myGroups={myGroups} discoverGroups={discoverGroups} />
    </PageContainer>
  )
}
