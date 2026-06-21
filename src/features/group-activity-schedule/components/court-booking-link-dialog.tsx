"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getMyBookingsClient } from "@/features/groups/api/groups-client"

interface CourtBookingLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLink: (payload: { title: string; note: string; bookingId: string }) => void
  isPending: boolean
}

export function CourtBookingLinkDialog({
  open,
  onOpenChange,
  onLink,
  isPending,
}: CourtBookingLinkDialogProps) {
  const [formTitle, setFormTitle] = useState("")
  const [formNote, setFormNote] = useState("")
  const [formBookingId, setFormBookingId] = useState("")

  const myBookingsQuery = useQuery({
    queryKey: ["my-bookings-for-linking"],
    queryFn: () => getMyBookingsClient({ limit: 100 }),
    enabled: open,
  })

  const eligibleBookings =
    myBookingsQuery.data?.data?.filter(
      (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
    ) ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formBookingId) return
    onLink({ title: formTitle, note: formNote, bookingId: formBookingId })
    setFormTitle("")
    setFormNote("")
    setFormBookingId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Liên kết lịch đặt sân</DialogTitle>
            <DialogDescription>
              Chọn một lịch đặt sân của bạn để liên kết vào nhóm này. Chỉ các
              lịch đặt sân có trạng thái đã xác nhận hoặc đã hoàn thành mới khả
              dụng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                placeholder="Ví dụ: Giao lưu sáng thứ 7"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                placeholder="Nhập ghi chú cho nhóm nếu có..."
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Chọn lịch đặt sân <span className="text-destructive">*</span>
              </label>
              {myBookingsQuery.isPending ? (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Đang tải danh sách đặt sân của bạn...
                </div>
              ) : myBookingsQuery.isError ? (
                <div className="py-2 text-sm text-destructive">
                  Lỗi tải danh sách lịch đặt sân. Vui lòng thử lại.
                </div>
              ) : eligibleBookings.length === 0 ? (
                <div className="py-2 text-sm text-muted-foreground">
                  Bạn không có lịch đặt sân nào có trạng thái CONFIRMED hoặc
                  COMPLETED.
                </div>
              ) : (
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={formBookingId}
                  onChange={(e) => setFormBookingId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn lịch đặt sân --</option>
                  {eligibleBookings.map((b) => {
                    const cName = b.center?.name || "Sân chưa rõ"
                    const dateStr = b.date
                      ? new Date(b.date).toLocaleDateString("vi-VN")
                      : "Chưa rõ ngày"
                    return (
                      <option key={b.id} value={b.id}>
                        {cName} - {dateStr}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !formBookingId}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Liên kết
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
