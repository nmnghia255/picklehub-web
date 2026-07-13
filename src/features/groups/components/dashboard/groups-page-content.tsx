"use client"

import { useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Group } from "@/features/groups/types"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { isArchivedGroup } from "../../utils/group-status"
import { GroupCard } from "./group-card"
import { GroupSearchControls } from "./group-search-controls"
import { GroupsEmptyState } from "./groups-empty-state"

type GroupListFilter = "all" | "active" | "archived"

type Props = {
  myGroups: Group[]
  myGroupsError?: boolean
}

export function GroupsPageContent({ myGroups, myGroupsError = false }: Props) {
  const { t } = useGroupsTranslation()
  const [keyword, setKeyword] = useState("")
  const [groupFilter, setGroupFilter] = useState<GroupListFilter>("active")

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
    ? t("dashboard.loadGroupsErrorTitle", "Không thể tải danh sách nhóm")
    : filteredMyGroups.length === 0 && keyword.trim().length > 0
      ? t("dashboard.noGroupsMatchedTitle", "Không có nhóm nào phù hợp")
      : groupFilter === "archived"
        ? t("dashboard.noArchivedGroupsTitle", "Chưa có nhóm đã lưu trữ")
        : groupFilter === "active"
          ? t("dashboard.noActiveGroupsTitle", "Chưa có nhóm đang hoạt động")
          : t("dashboard.noGroupsMatchedTitle", "Không có nhóm nào phù hợp")

  const emptyStateDescription = myGroupsError
    ? t(
        "dashboard.loadGroupsErrorDesc",
        "Dữ liệu nhóm của bạn chưa tải được. Vui lòng thử lại sau."
      )
    : filteredMyGroups.length === 0 && keyword.trim().length > 0
      ? t(
          "dashboard.noGroupsMatchedFilteredDesc",
          "Thử một từ khóa khác hoặc đổi bộ lọc để tìm trong nhóm của bạn."
        )
      : groupFilter === "archived"
        ? t(
            "dashboard.archivedGroupsDesc",
            "Các nhóm đã lưu trữ sẽ xuất hiện ở đây để bạn xem lại khi cần."
          )
        : groupFilter === "active"
          ? t(
              "dashboard.activeGroupsDesc",
              "Các nhóm đang hoạt động sẽ xuất hiện ở đây."
            )
          : t(
              "dashboard.noGroupsMatchedDesc",
              "Thử một từ khóa khác để tìm trong nhóm của bạn."
            )

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.myGroupsTitle", "Nhóm")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "dashboard.myGroupsDesc",
              "Quản lý và tham gia các hoạt động, tài chính và đặt sân cùng các nhóm của bạn."
            )}
          </p>
        </div>
        <Tabs
          value={groupFilter}
          onValueChange={(value) => setGroupFilter(value as GroupListFilter)}
          className="shrink-0"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">
              {t("dashboard.tabAll", "Tất cả")}
            </TabsTrigger>
            <TabsTrigger value="active">
              {t("dashboard.tabActive", "Đang hoạt động")}
            </TabsTrigger>
            <TabsTrigger value="archived">
              {t("archived", "Đã lưu trữ")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <GroupSearchControls
        placeholder={t(
          "dashboard.searchYourGroupsPlaceholder",
          "Tìm kiếm nhóm của bạn"
        )}
        value={keyword}
        onChange={setKeyword}
        ariaLabel={t("dashboard.searchYourGroupsAria", "Tìm kiếm nhóm của bạn")}
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
                actionLabel={t("dashboard.openGroupBtn", "Mở")}
                showRole
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
