"use client"

import React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecurringSocialsTranslation } from "@/i18n/use-recurring-socials-translation"

import type {
  RecurringSocialFormData,
  SchedulePreview,
} from "../recurring-socials.types"
import {
  formatCurrency,
  formatDateDisplayWithLocale,
  formatDateRangeDisplay,
} from "../recurring-socials.utils"

interface ConfirmCreateModalProps {
  scheduleCount: number
  schedules: SchedulePreview[]
  formData: RecurringSocialFormData
  locale?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmCreateModal({
  scheduleCount,
  schedules,
  formData,
  locale = "vi-VN",
  onConfirm,
  onCancel,
}: ConfirmCreateModalProps) {
  const { t } = useRecurringSocialsTranslation()

  return (
    <AlertDialog open={true} onOpenChange={onCancel}>
      <AlertDialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            {t("recurringSocials.confirm.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("recurringSocials.confirm.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.socialName")}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {formData.name}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.totalSocials")}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <Badge>{scheduleCount}</Badge>
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.dateRange")}
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatDateRangeDisplay(
                  formData.startDate,
                  formData.endDate,
                  locale
                )}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.timeRange")}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {formData.startTime} - {formData.endTime}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.courtsCount")}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {formData.selectedCourts.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("recurringSocials.confirm.estimatedCapacity")}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <Badge variant="secondary">
                  {t("recurringSocials.common.peopleCount", {
                    count:
                      formData.selectedCourts.length * formData.maxPerCourt,
                  })}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("recurringSocials.confirm.selectedCourts")}
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.selectedCourts.map((court) => (
                <Badge key={court.id} variant="outline">
                  {court.labelKey ? t(court.labelKey) : court.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("recurringSocials.confirm.firstSessions")}
            </p>
            <div className="overflow-hidden rounded-lg border">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("recurringSocials.preview.table.date")}
                    </TableHead>
                    <TableHead>
                      {t("recurringSocials.preview.table.time")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("recurringSocials.preview.table.capacity")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.slice(0, 5).map((schedule, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {formatDateDisplayWithLocale(schedule.date, locale)} -{" "}
                        {schedule.dayName}
                      </TableCell>
                      <TableCell>
                        {schedule.startTime} - {schedule.endTime}
                      </TableCell>
                      <TableCell className="text-right">
                        {t("recurringSocials.common.peopleCount", {
                          count: schedule.totalCapacity,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              {t("recurringSocials.confirm.costTitle")}
            </p>
            <div className="space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
              <p>
                {t("recurringSocials.confirm.participationFee", {
                  value: formatCurrency(formData.fee),
                })}
              </p>
              <p>
                {t("recurringSocials.confirm.courtRentFee", {
                  value: formatCurrency(formData.courtRentFee),
                })}
              </p>
              {formData.costNote && (
                <p>
                  {t("recurringSocials.confirm.costNote", {
                    note: formData.costNote,
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
            <p className="text-sm text-orange-900 dark:text-orange-100">
              {t("recurringSocials.confirm.warning", { count: scheduleCount })}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("recurringSocials.confirm.cancelButton")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            {t("recurringSocials.confirm.confirmButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
