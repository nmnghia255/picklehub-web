"use client"

import type { ReactNode } from "react"

import { GroupDetailDataProvider as GroupDetailDataProviderImpl } from "../../api/groups-client"
import type { Group } from "../../types"

interface GroupDetailDataProviderProps {
  groupId: string
  group: Group
  children: ReactNode
}

export function GroupDetailDataProvider({
  groupId,
  group,
  children,
}: GroupDetailDataProviderProps) {
  return (
    <GroupDetailDataProviderImpl groupId={groupId} group={group}>
      {children}
    </GroupDetailDataProviderImpl>
  )
}
