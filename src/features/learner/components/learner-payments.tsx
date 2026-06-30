"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LearnerPayments() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thanh toán. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    </div>
  )
}
