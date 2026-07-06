"use client"

import { Shield } from "lucide-react"
import Link from "next/link"

import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { useCoachProfile } from "@/features/coach/hooks/use-coach-queries"

export function BecomeCoachBanner() {
  const session = useSession()
  const { isLoading, isNotRegistered, isError, error } = useCoachProfile({
    enabled: !!session?.user,
  })

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border bg-background shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Không thể kiểm tra hồ sơ HLV"
        description={error?.message ?? "Đã có lỗi xảy ra"}
      />
    )
  }

  if (isNotRegistered) {
    return (
      <Card className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-primary/5 to-background shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold">Bạn muốn trở thành Huấn luyện viên?</p>
            <p className="text-sm text-muted-foreground">
              Đăng ký ngay để tạo lớp học, nhận học viên và phát triển sự nghiệp
              huấn luyện.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href="/coach/register">
              <Shield className="size-4" />
              Đăng ký trở thành HLV
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
