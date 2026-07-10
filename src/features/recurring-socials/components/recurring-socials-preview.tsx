"use client"

import React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

import type { RecurringSocialFormData } from "../recurring-socials.types"
import { SchedulePreview } from "../recurring-socials.types"
import {
  formatDateDisplayWithLocale,
  formatDateRangeDisplay,
  generateSchedulePreview,
  getRecurrenceTypeLabel,
} from "../recurring-socials.utils"

interface RecurringSocialsPreviewProps {
  formData: RecurringSocialFormData
  locale?: string
}

export function RecurringSocialsPreview({
  formData,
  locale = "vi-VN",
}: RecurringSocialsPreviewProps) {
  const { t } = useRecurringSocialsTranslation()
  const schedules = generateSchedulePreview(formData, locale)

  if (schedules.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recurringSocials.preview.title")}</CardTitle>
        <CardDescription>
          {t("recurringSocials.preview.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("recurringSocials.preview.totalSocials")}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {schedules.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("recurringSocials.preview.recurrenceType")}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              <Badge variant="outline">
                {getRecurrenceTypeLabel(formData.recurrenceType, t)}
              </Badge>
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("recurringSocials.preview.dateRange")}
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatDateRangeDisplay(
                formData.startDate,
                formData.endDate,
                locale
              )}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {t("recurringSocials.preview.timeRangeValue", {
              start: formData.startTime,
              end: formData.endTime,
            })}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("recurringSocials.preview.table.date")}
                </TableHead>
                <TableHead>{t("recurringSocials.preview.table.day")}</TableHead>
                <TableHead>
                  {t("recurringSocials.preview.table.time")}
                </TableHead>
                <TableHead className="text-right">
                  {t("recurringSocials.preview.table.courts")}
                </TableHead>
                <TableHead className="text-right">
                  {t("recurringSocials.preview.table.capacity")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {formatDateDisplayWithLocale(schedule.date, locale)}
                  </TableCell>
                  <TableCell>{schedule.dayName}</TableCell>
                  <TableCell className="text-sm">
                    {schedule.startTime} - {schedule.endTime}
                  </TableCell>
                  <TableCell className="text-right">
                    {schedule.courts}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {t("recurringSocials.common.peopleCount", {
                        count: schedule.totalCapacity,
                      })}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {t("recurringSocials.preview.infoMessage", {
              count: Math.min(10, schedules.length),
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
