"use client"

import { create } from "zustand"

import type { LinkedProvider } from "@/features/auth/types"
import type { User } from "@/features/profile/types"

interface HydrateProfilePayload {
  user: User | null
  linkedProviders: LinkedProvider[]
  sessionEmail: string
}

interface ProfileEditState {
  user: User | null
  linkedProviders: LinkedProvider[]
  sessionEmail: string
  displayName: string
  hydrateProfile: (payload: HydrateProfilePayload) => void
  setUser: (user: User | null) => void
}

function getFallbackDisplayName(email: string): string {
  return email.split("@")[0] || ""
}

function buildDisplayName(user: User | null, sessionEmail: string): string {
  return user?.name?.trim() || getFallbackDisplayName(sessionEmail)
}

export const useProfileEditStore = create<ProfileEditState>((set, get) => ({
  user: null,
  linkedProviders: [],
  sessionEmail: "",
  displayName: "",

  hydrateProfile: ({ user, linkedProviders, sessionEmail }) => {
    set({
      user,
      linkedProviders,
      sessionEmail,
      displayName: buildDisplayName(user, sessionEmail),
    })
  },

  setUser: (user) => {
    const sessionEmail = get().sessionEmail
    set({
      user,
      displayName: buildDisplayName(user, sessionEmail),
    })
  },
}))
