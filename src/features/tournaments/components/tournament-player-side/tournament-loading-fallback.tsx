"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function TournamentLoadingFallback() {
  const { t } = useTournamentTranslation()

  return (
    <div className="p-8 text-center text-gray-500">
      {t("common.loading", { defaultValue: "Loading..." })}
    </div>
  )
}
