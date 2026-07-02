"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, BookOpen, CalendarDays } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  useRevenueSummary,
  useClassRevenue,
  useBookingRevenue,
} from "../hooks/use-coach-queries"

function formatVnd(amount: number) {
  const safeAmount = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(safeAmount)
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i)

export function CoachIncomeOverview() {
  const [period, setPeriod] = useState<string>("month")
  const [year, setYear] = useState<number>(currentYear)
  const [classPage, setClassPage] = useState(1)
  const [bookingPage, setBookingPage] = useState(1)
  const [classFrom, setClassFrom] = useState("")
  const [classTo, setClassTo] = useState("")
  const [bookingFrom, setBookingFrom] = useState("")
  const [bookingTo, setBookingTo] = useState("")
  const limit = 10

  const { data, isLoading } = useRevenueSummary({ period, year })
  const { data: classRevenueData, isLoading: classLoading } = useClassRevenue({
    page: classPage, limit,
    from: classFrom ? new Date(classFrom).toISOString() : undefined,
    to: classTo ? new Date(classTo + "T23:59:59.999Z").toISOString() : undefined,
  })
  const { data: bookingRevenueData, isLoading: bookingLoading } = useBookingRevenue({
    page: bookingPage, limit,
    from: bookingFrom ? new Date(bookingFrom).toISOString() : undefined,
    to: bookingTo ? new Date(bookingTo + "T23:59:59.999Z").toISOString() : undefined,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="mb-2 size-4" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu thu nhập. Vui lòng quay lại sau.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Doanh thu lớp học</span>
              <TrendingUp className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.totals.classRevenueVnd)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Doanh thu đặt lịch</span>
              <DollarSign className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.totals.bookingRevenueVnd)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">Tổng doanh thu</span>
              <TrendingUp className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatVnd(data.totals.totalRevenueVnd)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Kỳ</Label>
          <Select value={period} onValueChange={(v) => { setPeriod(v); setClassPage(1); setBookingPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="quarter">Theo quý</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Năm</Label>
          <Select value={String(year)} onValueChange={(v) => { setYear(Number(v)); setClassPage(1); setBookingPage(1) }}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.buckets.length > 0 && (
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiết theo kỳ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.buckets}>
                  <XAxis
                    dataKey="periodLabel"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}tr`
                        : v >= 1000
                          ? `${(v / 1000).toFixed(0)}k`
                          : String(v)
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatVnd(value),
                      name === "classRevenueVnd"
                        ? "Doanh thu lớp học"
                        : "Doanh thu đặt lịch",
                    ]}
                    labelFormatter={(label) => `Kỳ: ${label}`}
                  />
                  <Bar
                    dataKey="classRevenueVnd"
                    name="classRevenueVnd"
                    stackId="a"
                    fill="hsl(221.2 83.2% 53.3%)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="bookingRevenueVnd"
                    name="bookingRevenueVnd"
                    stackId="a"
                    fill="hsl(142.1 76.2% 36.3%)"
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="divide-y">
              {data.buckets.map((bucket, index) => (
                <div
                  key={bucket.periodLabel ?? index}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm font-medium">
                    {bucket.periodLabel}
                  </span>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>Lớp: {formatVnd(bucket.classRevenueVnd)}</span>
                    <span>Đặt lịch: {formatVnd(bucket.bookingRevenueVnd)}</span>
                    <span className="font-semibold text-foreground">
                      {formatVnd(bucket.totalRevenueVnd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="classes" className="w-full">
        <TabsList>
          <TabsTrigger value="classes">
            <BookOpen className="size-4" />
            Doanh thu lớp học
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <CalendarDays className="size-4" />
            Doanh thu đặt lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Từ ngày</Label>
              <Input type="date" value={classFrom} onChange={(e) => { setClassFrom(e.target.value); setClassPage(1) }} className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Đến ngày</Label>
              <Input type="date" value={classTo} onChange={(e) => { setClassTo(e.target.value); setClassPage(1) }} className="w-40" />
            </div>
            {(classFrom || classTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setClassFrom(""); setClassTo(""); setClassPage(1) }}>
                Xoá bộ lọc
              </Button>
            )}
          </div>
          {classLoading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : classRevenueData?.data && classRevenueData.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {classRevenueData.data.map((item) => (
                  <div key={item.classId} className="flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{item.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.settledSessions}/{item.totalSessions} buổi · {item.enrolledLearnerCount} học viên · {item.settledEnrollmentCount} đã thanh toán
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatVnd(item.settledRevenueVnd)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.settledAt ? new Date(item.settledAt).toLocaleDateString("vi-VN") : "Chưa thanh toán"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {classRevenueData.pagination && classRevenueData.pagination.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setClassPage((p) => Math.max(1, p - 1)) }}
                        className={classPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: classRevenueData.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === classPage}
                          onClick={(e) => { e.preventDefault(); setClassPage(p) }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setClassPage((p) => Math.min(classRevenueData.pagination.totalPages, p + 1)) }}
                        className={classPage >= classRevenueData.pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu lớp học.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Từ ngày</Label>
              <Input type="date" value={bookingFrom} onChange={(e) => { setBookingFrom(e.target.value); setBookingPage(1) }} className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Đến ngày</Label>
              <Input type="date" value={bookingTo} onChange={(e) => { setBookingTo(e.target.value); setBookingPage(1) }} className="w-40" />
            </div>
            {(bookingFrom || bookingTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setBookingFrom(""); setBookingTo(""); setBookingPage(1) }}>
                Xoá bộ lọc
              </Button>
            )}
          </div>
          {bookingLoading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : bookingRevenueData?.data && bookingRevenueData.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {bookingRevenueData.data.map((item) => (
                  <div key={item.bookingId} className="flex items-center justify-between rounded-xl border p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{item.learnerProfile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.scheduledAt).toLocaleDateString("vi-VN")} · {item.durationMinutes} phút
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatVnd(item.priceVnd)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.settledAt ? new Date(item.settledAt).toLocaleDateString("vi-VN") : "Chưa thanh toán"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {bookingRevenueData.pagination && bookingRevenueData.pagination.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setBookingPage((p) => Math.max(1, p - 1)) }}
                        className={bookingPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: bookingRevenueData.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === bookingPage}
                          onClick={(e) => { e.preventDefault(); setBookingPage(p) }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setBookingPage((p) => Math.min(bookingRevenueData.pagination.totalPages, p + 1)) }}
                        className={bookingPage >= bookingRevenueData.pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu doanh thu đặt lịch.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
