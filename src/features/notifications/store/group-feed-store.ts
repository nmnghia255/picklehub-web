import { atom } from "jotai"

import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"

export const groupFeedNotificationsAtom = atom<GroupFeedNotificationItem[]>([])
