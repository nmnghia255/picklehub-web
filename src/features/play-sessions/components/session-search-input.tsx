"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type Props = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

export function SessionSearchInput({
  placeholder,
  value,
  onChange,
  ariaLabel,
}: Props) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="w-full pl-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  )
}
