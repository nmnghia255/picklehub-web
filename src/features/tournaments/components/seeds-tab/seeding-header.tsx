import { Loader2, Lock, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { useSeedingStore } from "./use-seeding-store"

interface SeedingHeaderProps {
  isEditable: boolean
  isLocked: boolean
}

export function SeedingHeader({ isEditable, isLocked }: SeedingHeaderProps) {
  const { t } = useTournamentTranslation()
  const selectedEventId = useSeedingStore((s) => s.selectedEventId)
  const isGenerating = useSeedingStore((s) => s.isGenerating)
  const isLocking = useSeedingStore((s) => s.isLocking)
  const seedsList = useSeedingStore((s) => s.seedsList)

  const handleAutoSeed = useSeedingStore((s) => s.handleAutoSeed)
  const handleLockSeeding = useSeedingStore((s) => s.handleLockSeeding)

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">
          {t("seeding.title")}
        </h1>
        <p className="text-gray-600">{t("seeding.subtitle")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => handleAutoSeed(t)}
          disabled={isGenerating || isLocked || !selectedEventId || !isEditable}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Shuffle className="mr-2 h-4 w-4" />
          )}
          {t("seeding.autoSeed")}
        </Button>
        <Button
          onClick={() => handleLockSeeding(t)}
          disabled={
            isLocking ||
            isLocked ||
            !selectedEventId ||
            seedsList.length === 0 ||
            !isEditable
          }
          className={cn(
            isLocked
              ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          {isLocking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lock className="mr-2 h-4 w-4" />
          )}
          {isLocked ? t("seeding.table.locked") : t("seeding.lockSeeding")}
        </Button>
      </div>
    </div>
  )
}
