"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"

const parseDateString = (dateStr: string) => {
  if (!dateStr) return undefined
  const [year, month, day] = dateStr.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

const formatDateString = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function Step3Registration() {
  const { t } = useTournamentTranslation()
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const setFormValue = useCreateTournamentStore((state) => state.setFormValue)

  const regOpenObj = parseDateString(formValues.regOpen)
  const regCloseObj = parseDateString(formValues.regClose)
  const startDateObj = parseDateString(formValues.startDate)

  const maxRegOpen = regCloseObj || startDateObj

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reg-open">{t("create.step2.regOpenLabel")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="reg-open"
                variant="outline"
                className={cn(
                  "mt-3 w-full justify-start text-left font-normal",
                  !regOpenObj && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {regOpenObj ? (
                  format(regOpenObj, "dd/MM/yyyy")
                ) : (
                  <span>dd/mm/yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={regOpenObj}
                onSelect={(date) => {
                  if (date) {
                    setFormValue("regOpen", formatDateString(date))
                  }
                }}
                disabled={maxRegOpen ? (date) => date > maxRegOpen : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="reg-close">{t("create.step2.regCloseLabel")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="reg-close"
                variant="outline"
                className={cn(
                  "mt-3 w-full justify-start text-left font-normal",
                  !regCloseObj && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {regCloseObj ? (
                  format(regCloseObj, "dd/MM/yyyy")
                ) : (
                  <span>dd/mm/yyyy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={regCloseObj}
                onSelect={(date) => {
                  if (date) {
                    setFormValue("regClose", formatDateString(date))
                  }
                }}
                disabled={(date) => {
                  if (regOpenObj && date < regOpenObj) return true
                  if (startDateObj && date > startDateObj) return true
                  return false
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
