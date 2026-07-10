"use client"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function SpectatorWaiting() {
  const { t } = useTournamentTranslation()

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-950/10">
      <div className="animate-pulse text-5xl">⏳</div>
      <h3 className="text-lg font-black tracking-widest text-neutral-600 uppercase dark:text-neutral-400">
        {t("referee.tracker.matchNotStarted", {
          defaultValue: "Match not started",
        })}
      </h3>
      <p className="max-w-xs text-xs text-muted-foreground">
        {t("referee.tracker.matchNotStartedDesc", {
          defaultValue:
            "Please wait for the referee to prepare and click the start match button at the court.",
        })}
      </p>
    </div>
  )
}
