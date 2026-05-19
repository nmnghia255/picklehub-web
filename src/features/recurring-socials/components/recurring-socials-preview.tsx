'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RecurringSocialFormData, SchedulePreview } from '../recurring-socials.types';
import {
  generateSchedulePreview,
  formatDateDisplay,
  formatDateRangeDisplay,
  getRecurrenceTypeLabel,
} from '../recurring-socials.utils';

interface RecurringSocialsPreviewProps {
  formData: RecurringSocialFormData;
}

export function RecurringSocialsPreview({ formData }: RecurringSocialsPreviewProps) {
  const schedules = generateSchedulePreview(formData);

  if (schedules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tóm tắt lịch social sẽ được tạo</CardTitle>
        <CardDescription>
          Danh sách các buổi social tự động sẽ được tạo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Tổng số social
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              {schedules.length}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Kiểu lặp
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              <Badge variant="outline">{getRecurrenceTypeLabel(formData.recurrenceType)}</Badge>
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Khoảng thời gian
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
              {formatDateRangeDisplay(formData.startDate, formData.endDate)}
            </p>
          </div>
        </div>

        {/* Time Range */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            ⏰ {formData.startTime} - {formData.endTime}
          </p>
        </div>

        {/* Schedule Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Thứ</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead className="text-right">Sân</TableHead>
                <TableHead className="text-right">Sức chứa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {formatDateDisplay(schedule.date)}
                  </TableCell>
                  <TableCell>{schedule.dayName}</TableCell>
                  <TableCell className="text-sm">
                    {schedule.startTime} - {schedule.endTime}
                  </TableCell>
                  <TableCell className="text-right">{schedule.courts}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{schedule.totalCapacity} người</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Info Message */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            💡 Hiển thị {Math.min(10, schedules.length)} buổi đầu tiên. Nhấn "Tiếp theo" để xác nhận tạo tất cả.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
