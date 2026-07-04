"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface TimeHeaderProps {
  timeSlots: string[]
}

export function TimeHeader({ timeSlots }: TimeHeaderProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="mb-2 flex border-b pb-2">
      <div className="flex w-32 shrink-0 items-center text-sm font-semibold text-gray-700">
        {t("scheduling.grid.courtsLabel", { defaultValue: "Courts" })}
      </div>
      <div className="flex flex-1 pl-2">
        {timeSlots.map((time) => (
          <div
            key={time}
            className="w-24 shrink-0 text-center text-xs font-semibold text-gray-600"
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  )
}
