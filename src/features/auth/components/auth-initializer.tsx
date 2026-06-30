"use client"

import { useHydrateAtoms } from "jotai/utils"

import { userAtom } from "@/features/auth/store/auth-store"
import type { SessionUser } from "@/features/auth/types"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import type { FeedNotification } from "@/features/feed/types"

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
