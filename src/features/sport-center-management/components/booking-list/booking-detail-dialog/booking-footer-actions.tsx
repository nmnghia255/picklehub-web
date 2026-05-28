"use client"

import { Button } from "@/components/ui/button"

interface Props {
  onClose: () => void
}

export function BookingFooterActions({ onClose }: Props) {
  return (
    <div className="flex justify-end border-t pt-2">
      <Button onClick={onClose} variant="outline">
        Đóng
      </Button>
    </div>
  )
}

export default BookingFooterActions
