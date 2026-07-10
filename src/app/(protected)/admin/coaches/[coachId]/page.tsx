"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminCoachDetailRedirect() {
  const params = useParams()
  const router = useRouter()
  const coachId = params.coachId as string

  useEffect(() => {
    if (coachId) {
      router.replace(`/admin?coachId=${coachId}`)
    }
  }, [coachId, router])

  return null
}
