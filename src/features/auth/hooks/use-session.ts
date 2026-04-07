"use client"

import { useEffect, useState } from "react"

import { getSession, type SessionData } from "@/lib/session"

export type Session = SessionData | null

export function useSession() {
  const [session, setSession] = useState<Session>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession()
        setSession(data as Session)
      } catch {
        setSession(null)
      }
    }

    fetchSession()
  }, [])

  return session
}
