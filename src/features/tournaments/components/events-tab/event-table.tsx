"use client"

import { Edit, Loader2, Trash2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { TournamentEvent } from "../../types/tournament-event"

interface EventTableProps {
  events: TournamentEvent[]
  canManageEvents: boolean
  isPending: boolean
  selectedEventId: number | null
  onRowClick: (eventId: number) => void
  onEditClick: (event: TournamentEvent) => void
  onDeleteClick: (eventId: string) => void
}

export function EventTable({
  events,
  canManageEvents,
  isPending,
  selectedEventId,
  onRowClick,
  onEditClick,
  onDeleteClick,
}: EventTableProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] min-w-44">
              {t("events.table.eventName")}
            </TableHead>
            <TableHead className="w-[10%] min-w-20">
              {t("events.table.type")}
            </TableHead>
            <TableHead className="w-[10%] min-w-20">
              {t("events.table.skillRange")}
            </TableHead>
            <TableHead className="w-[10%] min-w-20">
              {t("events.table.gender")}
            </TableHead>
            <TableHead className="w-[13%] min-w-20">
              {t("events.table.participants")}
            </TableHead>
            <TableHead className="w-[12%] min-w-20">
              {t("events.table.entryFee")}
            </TableHead>
            <TableHead className="w-[10%] min-w-20">
              {t("events.table.status")}
            </TableHead>
            {canManageEvents && (
              <TableHead className="w-[10%] min-w-20 text-right">
                {t("events.table.actions")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              onClick={() => onRowClick(event.id)}
              className={`cursor-pointer transition-colors hover:bg-gray-50/80 ${
                selectedEventId === event.id
                  ? "bg-emerald-50/50 hover:bg-emerald-50/60"
                  : ""
              }`}
            >
              <TableCell
                className="max-w-[220px] truncate font-medium text-gray-900"
                title={event.name}
              >
                {event.name}
              </TableCell>
              <TableCell className="capitalize">
                {t(`events.dialog.types.${event.type.toLowerCase()}`, {
                  defaultValue: event.type,
                })}
              </TableCell>
              <TableCell>{event.skillRange}</TableCell>
              <TableCell className="capitalize">
                {t(`events.dialog.genders.${event.gender.toLowerCase()}`, {
                  defaultValue: event.gender,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  {event.participants ?? 0}/{event.capacity}
                </div>
              </TableCell>
              <TableCell>{formatCurrencyVnd(event.entryFee)}</TableCell>
              <TableCell className="w-[10%] min-w-[80px]">
                <Badge
                  className={
                    event.status === "full"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }
                >
                  {event.status === "full"
                    ? t("events.table.statusFull", { defaultValue: "Full" })
                    : t("events.table.statusOpen", { defaultValue: "Open" })}
                </Badge>
              </TableCell>
              {canManageEvents && (
                <TableCell className="w-[10%] min-w-[80px] text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditClick(event)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteClick(event.id.toString())
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={canManageEvents ? 8 : 7}
                className="py-8 text-center text-gray-500"
              >
                {t("events.noEvents", { defaultValue: "No events found" })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
