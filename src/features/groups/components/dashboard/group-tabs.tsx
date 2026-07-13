"use client"

import { useMemo, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Group } from "@/features/groups/types"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { GroupCard } from "./group-card"
import { GroupSearchControls } from "./group-search-controls"
import { GroupsEmptyState } from "./groups-empty-state"

interface GroupTabsProps {
  myGroups: Group[]
  myGroupsError?: boolean
}

export function GroupTabs({ myGroups, myGroupsError = false }: GroupTabsProps) {
  const { t } = useGroupsTranslation()
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
          <TabsTrigger value="your-groups">
            {t("dashboard.yourGroupsTab", "Nhóm của bạn")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="your-groups" className="space-y-4">
        <GroupSearchControls
          placeholder={t(
            "dashboard.searchYourGroupsPlaceholder",
            "Tìm kiếm nhóm của bạn"
          )}
          value={myGroupsKeyword}
          onChange={setMyGroupsKeyword}
          ariaLabel={t(
            "dashboard.searchYourGroupsAria",
            "Tìm kiếm nhóm của bạn"
          )}
        />

        <div className="mt-6">
          {myGroupsError ? (
            <GroupsEmptyState
              title={t(
                "dashboard.loadGroupsErrorTitle",
                "Không thể tải danh sách nhóm"
              )}
              description={t(
                "dashboard.loadGroupsErrorDesc",
                "Dữ liệu nhóm của bạn chưa tải được. Vui lòng thử lại sau."
              )}
            />
          ) : filteredMyGroups.length === 0 ? (
            <GroupsEmptyState
              title={t(
                "dashboard.noGroupsMatchedTitle",
                "Không có nhóm nào phù hợp"
              )}
              description={t(
                "dashboard.noGroupsMatchedDesc",
                "Thử một từ khóa khác để tìm trong nhóm của bạn."
              )}
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
      </TabsContent>
    </Tabs>
  )
}
