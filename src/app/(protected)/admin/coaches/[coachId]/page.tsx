"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

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
