"use client"

import { format } from "date-fns"
import { enUS, vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useEffect } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { cn } from "@/lib/utils"

import type { SocialFormData } from "../../types/social"
import Field from "../social-detail/field"

function DateTimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const { t, i18n } = useSocialsTranslation()
  const dateLocale = i18n.language === "vi" ? vi : enUS

  const dateValue = value ? new Date(value) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const newDate = new Date(date)
    if (dateValue) {
      newDate.setHours(dateValue.getHours())
      newDate.setMinutes(dateValue.getMinutes())
    } else {
      newDate.setHours(12, 0, 0, 0)
    }
    const offset = newDate.getTimezoneOffset()
    const dateLocal = new Date(newDate.getTime() - offset * 60 * 1000)
    onChange(dateLocal.toISOString().slice(0, 16))
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (!time) return
    const [hours, mins] = time.split(":")
    const newDate = dateValue ? new Date(dateValue) : new Date()
    newDate.setHours(parseInt(hours), parseInt(mins), 0, 0)
    const offset = newDate.getTimezoneOffset()
    const dateLocal = new Date(newDate.getTime() - offset * 60 * 1000)
    onChange(dateLocal.toISOString().slice(0, 16))
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(dateValue!, "PPP", { locale: dateLocale })
            ) : (
              <span>{t("form.pickDate", { defaultValue: "Pick a date" })}</span>
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
      <Input
        type="time"
        disabled={disabled}
        value={value ? format(dateValue!, "HH:mm") : ""}
        onChange={handleTimeChange}
        className="w-40"
        onClick={(e) => {
          try {
            e.currentTarget.showPicker()
          } catch (_err) {
            // Ignore if showPicker is not supported
          }
        }}
      />
    </div>
  )
}

export function SocialFormScheduleCard({
  formData,
  setFormData,
  isEditMode,
}: {
  formData: SocialFormData
  setFormData: Dispatch<SetStateAction<SocialFormData>>
  isEditMode?: boolean
}) {
  const { t } = useSocialsTranslation()
  const hasInvalidTimeRange =
    Boolean(formData.startTime) &&
    Boolean(formData.endTime) &&
    new Date(formData.endTime) <= new Date(formData.startTime)

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <h2 className="text-lg font-semibold">{t("form.schedule")}</h2>
        <div className="space-y-4">
          <Field label={t("form.startTime")}>
            <DateTimePicker
              disabled={isEditMode}
              value={formData.startTime}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, startTime: val }))
              }
            />
          </Field>

          <Field label={t("form.endTime")}>
            <DateTimePicker
              disabled={isEditMode}
              value={formData.endTime}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, endTime: val }))
              }
            />
          </Field>

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
