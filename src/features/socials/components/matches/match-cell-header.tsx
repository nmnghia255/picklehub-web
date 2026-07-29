"use client"

import { MoreVertical, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface MatchCellHeaderProps {
  matchLabel: string
  courtName?: string
  matchId: string
  matchTypeLabel: string
  statusText: string
  statusBadgeColor: string
  onMatchTypeChange: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
  onDeleteMatch?: (matchId: string) => void
}

export function MatchCellHeader({
  matchLabel,
  courtName,
  matchId,
  matchTypeLabel,
  statusText,
  statusBadgeColor,
  onMatchTypeChange,
  onDeleteMatch,
}: MatchCellHeaderProps) {
  const { t } = useSocialsTranslation()

  return (
    <div className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2 truncate">
        <span className="text-md truncate leading-none font-bold text-foreground">
          {matchLabel}
        </span>
        {courtName && (
          <Badge
            variant="secondary"
            className="border-primary/20 bg-primary/10 text-[11px] font-medium text-primary"
          >
            {courtName}
          </Badge>
        )}
      </div>

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
              {t("matches.header.changeToSingles")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onMatchTypeChange(matchId, "DOUBLES")}
            >
              {t("matches.header.changeToDoubles")}
            </DropdownMenuItem>

            {onDeleteMatch && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteMatch(matchId)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("matches.header.deleteMatch", "Xóa trận đấu")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
