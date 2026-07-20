import type { CalendarActivity } from "../api/calendar-client"

interface PersonalCalendarEventItemProps {
  event: CalendarActivity
  onClick: (event: CalendarActivity) => void
}

function getEventDotColor(status: CalendarActivity["status"]) {
  if (status === "COMPLETED") return "bg-slate-400"
  if (status === "LIVE") return "bg-blue-500"
  return "bg-emerald-500"
}

function getEventTypeEmoji(type: CalendarActivity["type"]) {
  if (type === "SOCIAL_SESSION") return "🏓"
  if (type === "BOOKING") return "📅"
  return "🏆"
}

export function PersonalCalendarEventItem({
  event,
  onClick,
}: PersonalCalendarEventItemProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(event)
      }}
      className="group/item flex w-full items-center gap-2 truncate rounded-md border border-border/30 bg-muted/40 px-2 py-1.5 text-left text-[12px] font-semibold transition-all hover:border-primary/30 hover:bg-accent/60"
      title={`${event.title} (${event.location.name})`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${getEventDotColor(event.status)} shadow-xs`}
      />
      <span className="shrink-0 grayscale-[0.5] transition-all group-hover/item:grayscale-0">
        {getEventTypeEmoji(event.type)}
      </span>
      <span className="truncate text-foreground/80 transition-colors group-hover/item:text-primary">
        {event.title}
      </span>
    </button>
  )
}
