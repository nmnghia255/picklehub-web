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
  matchId: string
  matchTypeLabel: string
  statusText: string
  statusBadgeColor: string
  onMatchTypeChange: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
}

export function MatchCellHeader({
  matchId,
  matchTypeLabel,
  statusText,
  statusBadgeColor,
  onMatchTypeChange,
}: MatchCellHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {matchTypeLabel}
        </Badge>
        <Badge className={`text-xs ${statusBadgeColor}`}>{statusText}</Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
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
  )
}
