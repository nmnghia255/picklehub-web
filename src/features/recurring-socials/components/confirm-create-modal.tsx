'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SchedulePreview, RecurringSocialFormData } from '../recurring-socials.types';
import { formatDateDisplay, formatDateRangeDisplay, formatCurrency } from '../recurring-socials.utils';

interface ConfirmCreateModalProps {
  scheduleCount: number;
  schedules: SchedulePreview[];
  formData: RecurringSocialFormData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmCreateModal({
  scheduleCount,
  schedules,
  formData,
  onConfirm,
  onCancel,
}: ConfirmCreateModalProps) {
  return (
    <AlertDialog open={true} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Xác nhận tạo social tự động</AlertDialogTitle>
          <AlertDialogDescription>
            Vui lòng kiểm tra lại thông tin trước khi tạo
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tên social
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                {formData.name}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tổng số social sẽ tạo
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                <Badge>{scheduleCount}</Badge>
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

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Khung giờ
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                {formData.startTime} - {formData.endTime}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Số sân
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                {formData.selectedCourts.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Sức chứa dự kiến
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                <Badge variant="secondary">
                  {formData.selectedCourts.length * formData.maxPerCourt} người
                </Badge>
              </p>
            </div>
          </div>

          {/* Court List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sân được chọn:
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.selectedCourts.map(court => (
                <Badge key={court.id} variant="outline">
                  {court.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* First 5 Schedule Preview */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Danh sách 5 buổi đầu tiên:
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead className="text-right">Sức chứa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.slice(0, 5).map((schedule, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {formatDateDisplay(schedule.date)} - {schedule.dayName}
                      </TableCell>
                      <TableCell>
                        {schedule.startTime} - {schedule.endTime}
                      </TableCell>
                      <TableCell className="text-right">
                        {schedule.totalCapacity} người
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Cost Info */}
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              💰 Chi phí:
            </p>
            <div className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
              <p>• Giá tham gia: {formatCurrency(formData.fee)}/người</p>
              <p>• Chi phí sân: {formatCurrency(formData.courtRentFee)}/buổi</p>
              {formData.costNote && <p>• Ghi chú: {formData.costNote}</p>}
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4">
            <p className="text-sm text-orange-900 dark:text-orange-100">
              ⚠️ Hành động này sẽ tạo {scheduleCount} buổi social. Bạn có thể chỉnh sửa hoặc xóa từng buổi sau đó.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
            Xác nhận tạo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
