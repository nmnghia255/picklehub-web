"use client"

import { Lock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useSession } from "@/features/auth/hooks/use-session"

import type {
  Court,
  CourtEnvelopeResponse,
  PaginatedCourtResponse,
} from "../../types/court"
import { CourtDetailDrawer } from "./court-detail-drawer"
import { CourtsTable } from "./courts-table"

function unwrapCourts(
  payload: Court[] | CourtEnvelopeResponse | PaginatedCourtResponse | unknown
): Court[] {
  if (Array.isArray(payload)) return payload as Court[]
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as CourtEnvelopeResponse).data)
  ) {
    return (payload as CourtEnvelopeResponse).data
  }
  return []
}

export function PublicCourtsTab({
  centerId,
  centerName,
}: {
  centerId: string
  centerName?: string
}) {
  const session = useSession()
  const isLoggedIn = Boolean(session?.accessToken)

  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn || !centerId) return

    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetch(`/api/sport-centers/${centerId}/courts`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Không thể tải danh sách sân.")
        }
        return response.json()
      })
      .then((data) => {
        if (active) setCourts(unwrapCourts(data))
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Không thể tải danh sách sân."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isLoggedIn, centerId])

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <Lock className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">
          Vui lòng đăng nhập để xem danh sách sân
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          Thông tin chi tiết các sân chỉ hiển thị cho người dùng đã đăng nhập.
        </p>
        <Button asChild size="sm">
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CourtsTable
        courts={courts}
        loading={loading}
        onView={(court) => {
          setSelectedCourt(court)
          setDetailOpen(true)
        }}
      />

      <CourtDetailDrawer
        court={selectedCourt}
        centerName={centerName}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
