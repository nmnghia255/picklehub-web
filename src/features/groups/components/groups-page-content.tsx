"use client"

import { useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupCard } from "@/features/groups/components/group-card"
import { GroupSearchControls } from "@/features/groups/components/group-search-controls"
import { GroupsEmptyState } from "@/features/groups/components/groups-empty-state"
import type { Group } from "@/features/groups/types"

import { isArchivedGroup } from "../utils/group-status"

type GroupListFilter = "all" | "active" | "archived"

type Props = {
  myGroups: Group[]
  myGroupsError?: boolean
}

export function GroupsPageContent({ myGroups, myGroupsError = false }: Props) {
  const [keyword, setKeyword] = useState("")
  const [groupFilter, setGroupFilter] = useState<GroupListFilter>("all")

  const filteredByStatus = useMemo(() => {
    const safeMyGroups = Array.isArray(myGroups) ? myGroups : []

    if (groupFilter === "archived") {
      return safeMyGroups.filter((group) => isArchivedGroup(group.status))
    }

    if (groupFilter === "active") {
      return safeMyGroups.filter((group) => !isArchivedGroup(group.status))
    }

    return safeMyGroups
  }, [groupFilter, myGroups])

  const filteredMyGroups = useMemo(() => {
    const k = keyword.trim().toLowerCase()

    if (!k) return filteredByStatus

    return filteredByStatus.filter((group) => {
      const name = group.name.toLowerCase()
      const description = (group.description ?? "").toLowerCase()
      return name.includes(k) || description.includes(k)
    })
  }, [filteredByStatus, keyword])

  const emptyStateTitle = myGroupsError
    ? "Không thể tải danh sách nhóm"
    : filteredMyGroups.length === 0 && keyword.trim().length > 0
      ? "Không có nhóm nào phù hợp"
      : groupFilter === "archived"
        ? "Chưa có nhóm đã lưu trữ"
        : groupFilter === "active"
          ? "Chưa có nhóm đang hoạt động"
          : "Không có nhóm nào phù hợp"

  const emptyStateDescription = myGroupsError
    ? "Dữ liệu nhóm của bạn chưa tải được. Vui lòng thử lại sau."
    : filteredMyGroups.length === 0 && keyword.trim().length > 0
      ? "Thử một từ khóa khác hoặc đổi bộ lọc để tìm trong nhóm của bạn."
      : groupFilter === "archived"
        ? "Các nhóm đã lưu trữ sẽ xuất hiện ở đây để bạn xem lại khi cần."
        : groupFilter === "active"
          ? "Các nhóm đang hoạt động sẽ xuất hiện ở đây."
          : "Thử một từ khóa khác để tìm trong nhóm của bạn."

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold">Nhóm của tôi</h1>
        <Tabs
          value={groupFilter}
          onValueChange={(value) => setGroupFilter(value as GroupListFilter)}
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="archived">Đã lưu trữ</TabsTrigger>
          </TabsList>
        </Tabs>
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
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        ) : filteredMyGroups.length === 0 ? (
          <GroupsEmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
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
