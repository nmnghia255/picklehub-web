"use client"

import { MoreVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MatchCellHeaderProps {
  courtLabel: string
  matchId: string
  matchTypeLabel: string
  statusText: string
  statusBadgeColor: string
  onMatchTypeChange: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
}

export function MatchCellHeader({
  courtLabel,
  matchId,
  matchTypeLabel,
  statusText,
  statusBadgeColor,
  onMatchTypeChange,
}: MatchCellHeaderProps) {
  return (
    <div className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/20 px-2.5 py-2.5">
      <span className="text-md min-w-0 truncate leading-none font-semibold text-foreground">
        {courtLabel}
      </span>

      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        <Badge variant="outline" className="text-xs font-medium">
          {matchTypeLabel}
        </Badge>

        <Badge className={`text-xs ${statusBadgeColor}`}>{statusText}</Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-foreground dark:text-slate-200"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          >
            <DropdownMenuItem
              onClick={() => onMatchTypeChange(matchId, "SINGLES")}
            >
              Đổi thành Đơn
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onMatchTypeChange(matchId, "DOUBLES")}
            >
              Đổi thành Đôi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
