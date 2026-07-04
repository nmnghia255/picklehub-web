"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function CoachDetailRedirect() {
  const params = useParams()
  const router = useRouter()
  const coachId = params.coachId as string

  useEffect(() => {
    if (coachId) {
      router.replace(`/coaches?view=detail&coachId=${coachId}&tab=overview`)
    }
  }, [coachId, router])

  return null
}
