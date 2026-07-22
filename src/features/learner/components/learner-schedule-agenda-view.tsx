import { Calendar, Clock, DollarSign, MapPin, User } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import type { LearnerScheduleItem } from "@/features/coach/types/coach"
import { formatCurrency } from "@/utils/expense-utils"

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  upcoming: "secondary",
  live: "default",
  past: "outline",
  pending: "outline",
}

function formatTime(value: string, locale: string) {
  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusLabel(status: string, t: (key: string) => string) {
  return t(
    `learner.schedule.status.${status in STATUS_VARIANTS ? status : "unknown"}`
  )
}

function getKindLabel(kind: string, t: (key: string) => string) {
  return t(
    `learner.schedule.kind.${kind === "class" || kind === "booking" ? kind : "unknown"}`
  )
}

function AgendaItemCard({
  item,
  locale,
  onClick,
}: {
  item: LearnerScheduleItem
  locale: string
  onClick: () => void
}) {
  const { t } = useTranslation("common")
  const statusLabel = getStatusLabel(item.status, t)
  const statusVariant = STATUS_VARIANTS[item.status] ?? "outline"
  const coachName =
    item.coachProfile?.displayName ?? t("learner.schedule.unknownCoach")

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border bg-background p-4 text-left shadow-sm transition hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">
              {getKindLabel(item.kind, t)}
            </span>
            <p className="truncate text-sm font-medium">{item.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatTime(item.startsAt, locale)} -{" "}
              {formatTime(item.endsAt, locale)}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {coachName}
            </span>
            {item.locationDescription && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {item.locationDescription}
              </span>
            )}
            {item.priceVnd !== null && (
              <span className="flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {formatCurrency(item.priceVnd, "VND", locale)}
              </span>
            )}
          </div>
        </div>
        <Badge
          variant={statusVariant}
          className="shrink-0 rounded-full text-[10px]"
        >
          {statusLabel}
        </Badge>
      </div>
    </button>
  )
}

export function LearnerScheduleAgendaView({
  items,
  locale,
  onItemClick,
}: {
  items: LearnerScheduleItem[]
  locale: string
  onItemClick: (item: LearnerScheduleItem) => void
}) {
  const { t } = useTranslation("common")
  const grouped = useMemo(() => {
    const map = new Map<string, LearnerScheduleItem[]>()
    for (const item of items) {
      const key = item.startsAt.slice(0, 10)
      const dayItems = map.get(key) ?? []
      dayItems.push(item)
      map.set(key, dayItems)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Calendar className="mb-2 size-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          {t("learner.schedule.empty.agenda")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, dayItems]) => {
        const d = new Date(dateKey + "T00:00:00")
        const dateStr = d.toLocaleDateString(locale, {
          weekday: "long",
          month: "long",
          year: "numeric",
        })
        return (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {d.getDate()}
              </div>
              <div>
                <p className="text-sm font-medium">{dateStr}</p>
                <p className="text-xs text-muted-foreground">
                  {t("learner.schedule.agenda.sessions", {
                    count: dayItems.length,
                  })}
                </p>
              </div>
            </div>
            <div className="relative ml-5 space-y-3 border-l-2 border-muted pl-5">
              {dayItems.map((item) => (
                <AgendaItemCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
