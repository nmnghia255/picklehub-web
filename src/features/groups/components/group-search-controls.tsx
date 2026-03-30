"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { AddGroupDrawer } from "@/features/groups/components/add-group-drawer"

type Props = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

export function GroupSearchControls({
  placeholder,
  value,
  onChange,
  ariaLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
        />
      </div>
      <AddGroupDrawer />
    </div>
  )
}
