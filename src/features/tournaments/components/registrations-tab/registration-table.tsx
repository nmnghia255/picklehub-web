"use client"

import { Check, Eye, Loader2, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { getDateOnly } from "@/utils/time-helper"

import type { Player } from "../../types/player"
import type { RegistrationResponse } from "../../types/registration"

interface RegistrationTableProps {
  registrations: RegistrationResponse[]
  status: string
  isLoading: boolean
  onViewDetails?: (reg: RegistrationResponse) => void
  onApprove?: (reg: RegistrationResponse) => void
  onReject?: (reg: RegistrationResponse) => void
}

function PlayerAvatar({
  player,
  className,
}: {
  player: Player
  className?: string
}) {
  const initials = player.name
    ? player.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const isUrl =
    player.avatar &&
    (player.avatar.startsWith("http://") ||
      player.avatar.startsWith("https://") ||
      player.avatar.startsWith("/"))

  return (
    <Avatar className={className}>
      {isUrl && <AvatarImage src={player.avatar} alt={player.name} />}
      <AvatarFallback className="bg-emerald-100 text-emerald-700">
        {isUrl ? initials : player.avatar || initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function RegistrationTable({
  registrations,
  status,
  isLoading,
  onViewDetails,
  onApprove,
  onReject,
}: RegistrationTableProps) {
  const { t } = useTournamentTranslation()

  const hasActions = status === "pending" && (!!onApprove || !!onReject)

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex min-h-32 items-center justify-center bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] min-w-[150px] md:w-[20%]">
              {t("registrations.table.player")}
            </TableHead>
            <TableHead className="hidden w-[20%] min-w-[150px] sm:table-cell">
              {t("registrations.table.partner")}
            </TableHead>
            <TableHead className="hidden w-[25%] min-w-[150px] sm:table-cell md:w-[20%]">
              {t("registrations.table.event")}
            </TableHead>
            <TableHead className="hidden w-[10%] min-w-[70px] sm:table-cell">
              {t("registrations.table.rating")}
            </TableHead>
            <TableHead className="w-[15%] min-w-[100px] sm:w-[12%]">
              {t("registrations.table.payment")}
            </TableHead>
            <TableHead className="hidden w-[10%] min-w-[100px] lg:table-cell">
              {t("registrations.table.date")}
            </TableHead>
            {(hasActions || !!onViewDetails) && (
              <TableHead className="w-[15%] min-w-[80px] text-right sm:w-[8%]">
                {t("registrations.table.actions")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => {
            const isPaid =
              reg.paymentStatus === "completed" || reg.paymentStatus === "paid"
            return (
              <TableRow
                key={reg.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                <TableCell className="max-w-[200px]">
                  <div className="flex min-w-0 items-center gap-3">
                    <PlayerAvatar player={reg.player} />
                    <span className="truncate font-medium text-gray-900">
                      {reg.player.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden max-w-[200px] sm:table-cell">
                  {reg.partner ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <PlayerAvatar player={reg.partner} className="h-8 w-8" />
                      <span className="truncate text-sm text-gray-700">
                        {reg.partner.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                <TableCell className="hidden max-w-[180px] truncate sm:table-cell">
                  {reg.event}
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className="bg-white font-mono text-gray-700"
                  >
                    {reg.player.rating.toFixed(1)}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    className={
                      isPaid
                        ? "border-none bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100"
                        : "border-none bg-yellow-100 text-yellow-700 shadow-none hover:bg-yellow-100"
                    }
                  >
                    {isPaid
                      ? t("registrations.table.paid")
                      : t("registrations.table.pending")}
                  </Badge>
                </TableCell>

                <TableCell className="hidden text-sm text-gray-600 lg:table-cell">
                  {getDateOnly(reg.registrationDate)}
                </TableCell>

                {(hasActions || !!onViewDetails) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(reg)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {status === "pending" && onApprove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => onApprove(reg)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {status === "pending" && onReject && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onReject(reg)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}

          {registrations.length === 0 && !isLoading && (
            <TableRow>
              <TableCell
                colSpan={hasActions || !!onViewDetails ? 7 : 6}
                className="py-12 text-center text-gray-500"
              >
                {t("registrations.noRegistrations", {
                  defaultValue: "No registrations found",
                })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
