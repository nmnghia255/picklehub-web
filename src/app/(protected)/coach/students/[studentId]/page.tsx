import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CoachPageHeader } from "@/features/coach/components/coach-page-header"

export default async function StudentDetailPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/coach/students">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <CoachPageHeader
            title="Chi tiết học viên"
            description="Xem nhanh thông tin cơ bản, lịch sử học, lộ trình hiện tại và đánh giá tiến bộ."
          />
        </div>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu học viên. Vui lòng quay lại sau.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
