"use client"

import { useEffect, useState } from "react"

import { getSession } from "@/lib/session"

export type Session = {
  user?: {
    id: string
    name: string
    email: string
  }
} | null

export function useSession() {
  const [session, setSession] = useState<Session>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession()
        setSession(data)
      } catch {
        setSession(null)
      }
    }

    fetchSession()
  }, [])

  return session
}
