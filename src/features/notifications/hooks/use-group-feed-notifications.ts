import { useQuery } from "@tanstack/react-query"

import { getGroupFeedNotificationsClient } from "@/features/groups/api/groups-client"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"

export function useGroupFeedNotifications(groupId: string) {
  const { t } = useGroupsTranslation()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["group-feed-notifications", groupId],
    queryFn: () => getGroupFeedNotificationsClient(groupId),
    enabled: !!groupId,
  })

  const mappedNotifications = (data ?? []).map((n) => ({
    id: n.id,
    groupId: n.groupId,
    title: n.title,
    message: n.message,
    sentAt: n.createdAt,
    senderName: t("roleOwner", "Trưởng nhóm"),
  }))

  return {
    notifications: mappedNotifications as GroupFeedNotificationItem[],
    isLoading,
    error,
    refresh: refetch,
  }
}
