"use client"

import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MultiSelectOption {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select items...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((item) => item !== value))
    } else {
      onSelectionChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value))
  }

  const selectedLabels = selected
    .map((s) => options.find((opt) => opt.value === s)?.label)
    .filter(Boolean)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {selected.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selected.length - 2}
                </Badge>
              )}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleToggle(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

      {/* Selected Items as Badges */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((s) => {
            const label = options.find((opt) => opt.value === s)?.label
            return (
              <Badge key={s} variant="secondary" className="gap-1">
                {label}
                <button
                  onClick={() => handleRemove(s)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </Popover>
  )
}
