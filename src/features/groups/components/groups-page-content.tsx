"use client"

import { useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { GroupCard } from "@/features/groups/components/group-card"
import { GroupSearchControls } from "@/features/groups/components/group-search-controls"
import { GroupsEmptyState } from "@/features/groups/components/groups-empty-state"
import type { Group } from "@/features/groups/types"

type Props = {
  myGroups: Group[]
  myGroupsError?: boolean
}

export function GroupsPageContent({ myGroups, myGroupsError = false }: Props) {
  const [keyword, setKeyword] = useState("")

  const filteredMyGroups = useMemo(() => {
    const safeMyGroups = Array.isArray(myGroups) ? myGroups : []
    const k = keyword.trim().toLowerCase()

    if (!k) return safeMyGroups

    return safeMyGroups.filter((group) => {
      const name = group.name.toLowerCase()
      const description = (group.description ?? "").toLowerCase()
      return name.includes(k) || description.includes(k)
    })
  }, [keyword, myGroups])

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nhóm của tôi</h1>
      </div>

      <GroupSearchControls
        placeholder="Tìm kiếm nhóm của bạn"
        value={keyword}
        onChange={setKeyword}
        ariaLabel="Tìm kiếm nhóm của bạn"
      />

      <div className="mt-6">
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
      </div>
    </PageContainer>
  )
}
