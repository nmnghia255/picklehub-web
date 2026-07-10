"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function TournamentLoading() {
  const { t } = useTournamentTranslation()
  return (
    <div className="p-8 text-center text-gray-500">
      {t("loadingTournamentInfo", "Đang tải thông tin giải đấu...")}
    </div>
  )
}
