"use client"

import { MapPin } from "lucide-react"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function NoCourtsView() {
  const { t } = useTournamentTranslation()

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-gray-50 p-6">
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
        <MapPin className="mx-auto mb-4 h-12 w-12 animate-pulse text-emerald-500" />
        <h3 className="mb-2 text-base font-semibold text-gray-900">
          {t("scheduling.grid.noCourts", {
            defaultValue:
              "No courts booked for this Sport Center on the selected date.",
          })}
        </h3>
        <p className="text-sm text-gray-400">
          {t("scheduling.grid.noCourtsSub", {
            defaultValue:
              "Please confirm your court bookings in the Booking tab first.",
          })}
        </p>
      </div>
    </div>
  )
}
