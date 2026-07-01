"use client"

import { Loader2 } from "lucide-react"
import { Suspense } from "react"

import BookingPage from "@/features/tournaments/components/booking-page/booking"

export default function Page() {
  return (
    <div className="tournament-management-root flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <BookingPage />
      </Suspense>
    </div>
  )
}
