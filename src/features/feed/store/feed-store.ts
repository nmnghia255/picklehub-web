import { atom } from "jotai"

import { feedNotifications } from "../mock-data/feed-notifications"

export const notificationFeedAtom = atom(feedNotifications)
