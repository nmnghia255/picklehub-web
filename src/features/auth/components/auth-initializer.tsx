"use client"

import { useHydrateAtoms } from "jotai/utils"

import { userAtom } from "@/features/auth/store/auth-store"
import type { SessionUser } from "@/features/auth/types"
import type { FeedNotification } from "@/features/feed/mock-data/feed-notifications"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"

interface AuthInitializerProps {
  user: SessionUser | null
  notifications: FeedNotification[]
}

export function AuthInitializer({ user, notifications }: AuthInitializerProps) {
  useHydrateAtoms([
    [userAtom, user],
    [notificationFeedAtom, notifications],
  ])
  return null
}
