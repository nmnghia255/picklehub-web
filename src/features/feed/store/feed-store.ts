import { atom } from "jotai"

import type { FeedNotification } from "@/features/feed/types"

export const notificationFeedAtom = atom<FeedNotification[]>([])
