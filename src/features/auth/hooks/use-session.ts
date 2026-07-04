"use client"

import { useQuery } from "@tanstack/react-query"

import type { SessionData } from "@/lib/session"

export type Session = SessionData | null

async function fetchSession(): Promise<Session> {
  try {
    const response = await fetch("/api/auth/session")

    if (!response.ok) {
      return null
    }

    return (await response.json()) as SessionData
  } catch {
    return null
  }
}

export function useSession() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  return session ?? null
}
