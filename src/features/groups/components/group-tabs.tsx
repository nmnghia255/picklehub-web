"use client"

import { useMemo, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupCard } from "@/features/groups/components/group-card"
import { GroupSearchControls } from "@/features/groups/components/group-search-controls"
import { GroupsEmptyState } from "@/features/groups/components/groups-empty-state"
import type { Group } from "@/features/groups/types"

interface GroupTabsProps {
  myGroups: Group[]
  myGroupsError?: boolean
}

export function GroupTabs({ myGroups, myGroupsError = false }: GroupTabsProps) {
  const [myGroupsKeyword, setMyGroupsKeyword] = useState("")

  const filteredMyGroups = useMemo(() => {
    const safeMyGroups = Array.isArray(myGroups) ? myGroups : []
    const keyword = myGroupsKeyword.trim().toLowerCase()

    if (!keyword) {
      return safeMyGroups
    }

    return safeMyGroups.filter((group) => {
      const name = group.name.toLowerCase()
      const description = (group.description ?? "").toLowerCase()
      return name.includes(keyword) || description.includes(keyword)
    })
  }, [myGroupsKeyword, myGroups])

  return (
    <Tabs defaultValue="your-groups" className="gap-6">
      <div className="flex justify-center">
        <TabsList className="w-full max-w-xl">
          <TabsTrigger value="your-groups">Nhóm của bạn</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="your-groups" className="space-y-4">
        <GroupSearchControls
          placeholder="Tìm kiếm nhóm của bạn"
          value={myGroupsKeyword}
          onChange={setMyGroupsKeyword}
          ariaLabel="Tìm kiếm nhóm của bạn"
        />

        {myGroupsError ? (
          <GroupsEmptyState
            title="Không thể tải danh sách nhóm"
            description="Dữ liệu nhóm của bạn chưa tải được. Vui lòng thử lại sau."
          />
        ) : filteredMyGroups.length === 0 ? (
          <GroupsEmptyState
            title="Không có nhóm nào phù hợp"
            description="Thử một từ khóa khác để tìm trong nhóm của bạn."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMyGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                actionLabel="Mở"
                showRole
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
