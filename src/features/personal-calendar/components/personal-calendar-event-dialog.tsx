import type { TFunction } from "i18next"
import { Clock, Info, MapPin, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import type { CalendarActivity } from "../api/calendar-client"
import {
  CalendarActivityStatusBadge,
  CalendarActivityTypeBadge,
} from "./personal-calendar-event-badges"

interface PersonalCalendarEventDialogProps {
  formatDateString: (value: string) => string
  formatTime: (value: string) => string
  onOpenChange: (open: boolean) => void
  open: boolean
  selectedEvent: CalendarActivity | null
  t: TFunction<"common">
}

export function PersonalCalendarEventDialog({
  formatDateString,
  formatTime,
  onOpenChange,
  open,
  selectedEvent,
  t,
}: PersonalCalendarEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] animate-in overflow-y-auto rounded-xl border border-border bg-card p-0 shadow-2xl duration-200 fade-in sm:max-w-[500px]">
        <div className="relative h-2.5 w-full bg-primary" />

        {selectedEvent && (
          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2.5">
                <CalendarActivityTypeBadge type={selectedEvent.type} t={t} />
                <CalendarActivityStatusBadge
                  status={selectedEvent.status}
                  t={t}
                />
              </div>
              <DialogTitle className="text-xl leading-snug font-extrabold tracking-tight text-foreground">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="size-3.5 text-primary" />
                {t("calendar.detailDescription")}
              </DialogDescription>
            </DialogHeader>

            <Separator className="bg-border/60" />

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                  <Clock className="size-4 text-primary/80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("calendar.time")}
                  </p>
                  <p className="font-bold text-foreground/90">
                    {formatTime(selectedEvent.startTime)} -{" "}
                    {formatTime(selectedEvent.endTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateString(selectedEvent.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                  <MapPin className="size-4 text-primary/80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("calendar.location")}
                  </p>
                  <p className="leading-relaxed font-medium text-foreground/95">
                    {selectedEvent.location.name}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {selectedEvent.location.address}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                  <User className="size-4 text-primary/80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("calendar.organizer")}
                  </p>
                  <p className="font-semibold text-foreground/90">
                    {selectedEvent.organizer}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                  <Users className="size-4 text-primary/80" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("calendar.participants")}
                  </p>
                  <p className="font-semibold text-foreground/90">
                    {t("calendar.participantsJoined", {
                      count: selectedEvent.participantsCount,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-1.5">
              <h5 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                {t("calendar.descriptionLabel")}
              </h5>
              <p className="rounded-lg border border-border/30 bg-muted/40 p-3 text-sm leading-relaxed text-foreground/80">
                {selectedEvent.description}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                {t("calendar.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
