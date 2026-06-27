"use client"

import { BackButton } from "@/components/common/back-button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export default function BookingHeader() {
  const { t } = useTournamentTranslation()

  return (
    <section className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {t("booking.page.title", { defaultValue: "Book Tournament Slots" })}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("booking.page.subtitle", {
            defaultValue:
              "Select a date and pick available slots from the visual timeline grid below.",
          })}
        </p>
      </div>
      <BackButton emerald className="h-9" />
    </section>
  )
}
