"use client"

import { useHydrateAtoms } from "jotai/utils"

import { userAtom } from "@/features/auth/store/auth-store"
import type { SessionUser } from "@/features/auth/types"

interface AuthInitializerProps {
  user: SessionUser | null
}

export function AuthInitializer({ user }: AuthInitializerProps) {
  useHydrateAtoms([[userAtom, user]])
  return null
}
