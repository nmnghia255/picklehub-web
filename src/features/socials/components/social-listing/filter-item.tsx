import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { FilterOption } from "../../types/filter-options"

interface FilterItemProps<T> {
  label: string
  icon?: LucideIcon
  toneClassName?: "text-sky-500"
  selectionOptions: FilterOption<T>[]
  selectedValue: T
  onValueChange: (value: T) => void
}

export const FilterItem = <T,>({
  label,
  icon: Icon,
  toneClassName,
  selectionOptions,
  selectedValue,
  onValueChange,
}: FilterItemProps<T>) => {
  const toSelectValue = (val: T): string => {
    if (val === null || val === undefined) return "___null___"
    return String(val)
  }

  const handleSelectChange = (stringValue: string) => {
    if (stringValue === "___null___") {
      const nullOption = selectionOptions.find((opt) => opt.value === null)
      onValueChange(nullOption ? nullOption.value : (null as unknown as T))
      return
    }

    const matchedOption = selectionOptions.find(
      (opt) => String(opt.value) === stringValue
    )

    if (matchedOption) {
      onValueChange(matchedOption.value)
    }
  }

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <Label className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${toneClassName}`} />}
        {label}
      </Label>

      <Select
        value={toSelectValue(selectedValue)}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {selectionOptions.map((option, index) => (
            <SelectItem
              key={`${index}-${toSelectValue(option.value)}`}
              value={toSelectValue(option.value)}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
