"use client"

import { useEffect, useState } from "react"

import type { SessionData } from "@/lib/session"

export type Session = SessionData | null

export function useSession() {
  const [session, setSession] = useState<Session>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session")

        if (!response.ok) {
          setSession(null)
          return
        }

        const data = (await response.json()) as SessionData
        setSession(data)
      } catch {
        setSession(null)
      }
    }

    fetchSession()
  }, [])

  return session
}
