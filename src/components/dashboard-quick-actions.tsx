"use client"

import { Plus, UserCheck, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DashboardQuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Plus className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Tạo Nhóm Mới</h3>
          <p className="text-sm text-muted-foreground">Khởi tạo một nhóm mới</p>
        </div>
        <Button size="sm" asChild className="mt-auto">
          <Link href="/groups/create">Tạo Nhóm</Link>
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Nhóm Của Tôi</h3>
          <p className="text-sm text-muted-foreground">Xem tất cả nhóm bạn</p>
        </div>
        <Button size="sm" variant="outline" asChild className="mt-auto">
          <Link href="/groups">Xem Nhóm</Link>
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <UserCheck className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Hồ Sơ</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin cá nhân
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="mt-auto">
          <Link href="/profile">Cài Đặt</Link>
        </Button>
      </Card>
    </div>
  )
}
