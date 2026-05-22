"use client"

import { MoreHorizontal, PlusCircle, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { CreditRecord } from "../../credit-management/court-credits-data"

export default function CreditActionsDropdown({
  credit,
  onView,
  onCancelCredit,
  onCreateManualCredit,
}: {
  credit: CreditRecord
  onView: (credit: CreditRecord) => void
  onCancelCredit: (credit: CreditRecord) => void
  onCreateManualCredit: (credit: CreditRecord) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onView(credit)}>
          <Search className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-rose-600 focus:text-rose-600"
          onClick={() => onCancelCredit(credit)}
        >
          <Trash2 className="mr-2 size-4" />
          Cancel Credit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onCreateManualCredit(credit)}>
          <PlusCircle className="mr-2 size-4" />
          Create Manual Credit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
