import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../types/tournament-event"
import { useSeedingStore } from "./use-seeding-store"

interface SeedingSelectorProps {
  events: TournamentEvent[]
}

export function SeedingSelector({ events }: SeedingSelectorProps) {
  const { t } = useTournamentTranslation()
  const selectedEventId = useSeedingStore((s) => s.selectedEventId)
  const setSelectedEventId = useSeedingStore((s) => s.setSelectedEventId)

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {t("seeding.selectEvent")}
      </label>
      <div className="w-full sm:w-[280px]">
        <Select
          value={selectedEventId}
          onValueChange={(val) => setSelectedEventId(val)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder={t("seeding.chooseEvent")} />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.name} ({event.skillRange})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
