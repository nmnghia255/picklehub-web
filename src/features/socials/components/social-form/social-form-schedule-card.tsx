"use client"

import { format } from "date-fns"
import { enUS, vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { cn } from "@/lib/utils"

import type { SocialFormData } from "../../types/social"
import Field from "../social-detail/field"

const isValidDate = (dStr: string | undefined) =>
  dStr && !isNaN(new Date(dStr).getTime())

export function SocialFormScheduleCard({
  formData,
  setFormData,
  isEditMode,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
  isEditMode?: boolean
}) {
  const { t, i18n } = useSocialsTranslation()
  const dateLocale = i18n.language === "vi" ? vi : enUS

  const hasInvalidTimeRange =
    Boolean(formData.startTime) &&
    Boolean(formData.endTime) &&
    new Date(formData.endTime) <= new Date(formData.startTime)

  const dateValue = isValidDate(formData.startTime)
    ? new Date(formData.startTime as string)
    : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    setFormData((prev) => {
      const prevStart = isValidDate(prev.startTime)
        ? new Date(prev.startTime as string)
        : null
      const prevEnd = isValidDate(prev.endTime)
        ? new Date(prev.endTime as string)
        : null

      const newStart = new Date(date)
      if (prevStart) {
        newStart.setHours(prevStart.getHours(), prevStart.getMinutes(), 0, 0)
      } else {
        newStart.setHours(12, 0, 0, 0)
      }

      const newEnd = new Date(date)
      if (prevEnd) {
        newEnd.setHours(prevEnd.getHours(), prevEnd.getMinutes(), 0, 0)
      } else {
        newEnd.setHours(14, 0, 0, 0)
      }

      const offsetStart = newStart.getTimezoneOffset()
      const startLocal = new Date(newStart.getTime() - offsetStart * 60 * 1000)

      const offsetEnd = newEnd.getTimezoneOffset()
      const endLocal = new Date(newEnd.getTime() - offsetEnd * 60 * 1000)

      return {
        ...prev,
        startTime: startLocal.toISOString().slice(0, 16),
        endTime: endLocal.toISOString().slice(0, 16),
      }
    })
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (!time) return
    const [hours, mins] = time.split(":")
    setFormData((prev) => {
      const newDate = isValidDate(prev.startTime)
        ? new Date(prev.startTime as string)
        : new Date()
      newDate.setHours(parseInt(hours), parseInt(mins), 0, 0)
      const offset = newDate.getTimezoneOffset()
      const dateLocal = new Date(newDate.getTime() - offset * 60 * 1000)
      return { ...prev, startTime: dateLocal.toISOString().slice(0, 16) }
    })
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (!time) return
    const [hours, mins] = time.split(":")
    setFormData((prev) => {
      const baseDate = isValidDate(prev.startTime)
        ? new Date(prev.startTime as string)
        : new Date()
      const newDate = new Date(baseDate)
      newDate.setHours(parseInt(hours), parseInt(mins), 0, 0)
      const offset = newDate.getTimezoneOffset()
      const dateLocal = new Date(newDate.getTime() - offset * 60 * 1000)
      return { ...prev, endTime: dateLocal.toISOString().slice(0, 16) }
    })
  }

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">{t("form.schedule")}</h2>
        <div className="space-y-4">
          <Field
            label={t("playSessionOverview.date", { defaultValue: "Date" })}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateValue && "text-muted-foreground"
                  )}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? (
                    format(dateValue, "PPP", { locale: dateLocale })
                  ) : (
                    <span>
                      {t("form.pickDate", { defaultValue: "Pick a date" })}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateSelect}
                  locale={dateLocale}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("form.startTime")}>
              <Input
                type="time"
                disabled={!dateValue}
                value={
                  isValidDate(formData.startTime)
                    ? format(new Date(formData.startTime as string), "HH:mm")
                    : ""
                }
                onChange={handleStartTimeChange}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker()
                  } catch (_err) {}
                }}
              />
            </Field>

            <Field label={t("form.endTime")}>
              <Input
                type="time"
                disabled={!dateValue}
                value={
                  isValidDate(formData.endTime)
                    ? format(new Date(formData.endTime as string), "HH:mm")
                    : ""
                }
                onChange={handleEndTimeChange}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker()
                  } catch (_err) {}
                }}
              />
            </Field>
          </div>

          {hasInvalidTimeRange && (
            <Alert variant="destructive">
              <AlertDescription>
                {t("form.validationEndAfterStart")}
              </AlertDescription>
            </Alert>
          )}

          <Field label={t("form.cancellationFreeze")}>
            <Input
              type="number"
              value={formData.cancellationFreezeHours ?? 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cancellationFreezeHours: parseInt(e.target.value) || 0,
                }))
              }
              min={0}
              max={168}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
