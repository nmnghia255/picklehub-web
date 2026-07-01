"use client"

import { useQuery } from "@tanstack/react-query"
import { CoachClient } from "@/features/coach/api/coach-client"
import { coachQueryKeys } from "@/features/coach/api/query-keys"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, Users, Clock } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import dayjs from "dayjs"
import { useState, useEffect, useCallback } from "react"

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"] as const

const levelBadgeVariant: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  Beginner: "secondary",
  Intermediate: "default",
  Advanced: "outline",
  Pro: "destructive",
}

const levelLabel: Record<string, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

function ClassCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫"
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ClassesPage() {
  const [city, setCity] = useState("")
  const [level, setLevel] = useState("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const debouncedCity = useDebounce(city, 500)

  const params = {
    ...(debouncedCity && { city: debouncedCity }),
    ...(level && level !== "all" && { level }),
    ...(from && { from }),
    ...(to && { to }),
    page,
    limit: 12,
  }

  const { data, isLoading } = useQuery({
    queryKey: coachQueryKeys.discoverClasses(params),
    queryFn: () => CoachClient.discoverOpenClasses(params),
  })

  const classes = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 0

  // Reset pagination when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedCity, level, from, to])

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    },
    [totalPages]
  )

  return (
    <PageContainer className="space-y-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Khám phá lớp học
        </h1>
        <p className="text-sm text-muted-foreground">
          Tìm kiếm lớp học pickleball phù hợp với bạn
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thành phố</label>
            <Input
              placeholder="Nhập thành phố..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Trình độ</label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả trình độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {levelLabel[lvl]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Từ ngày</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ClassCardSkeleton key={i} />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">
                Không tìm thấy lớp học nào
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/classes/${cls.id}`}
                    className="group block"
                  >
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        {cls.coverImageUrl ? (
                          <img
                            src={cls.coverImageUrl}
                            alt={cls.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Calendar className="size-10" />
                          </div>
                        )}
                        <Badge
                          className="absolute right-2 top-2"
                          variant={levelBadgeVariant[cls.level]}
                        >
                          {levelLabel[cls.level] ?? cls.level}
                        </Badge>
                      </div>

                      <CardContent className="space-y-3 p-4">
                        <h3 className="line-clamp-1 font-semibold">
                          {cls.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage
                              src={cls.coachProfile.avatarUrl}
                              alt={cls.coachProfile.displayName}
                            />
                            <AvatarFallback>
                              {cls.coachProfile.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {cls.coachProfile.displayName}
                          </span>
                        </div>

                        <div className="text-lg font-bold text-primary">
                          {formatPrice(cls.priceVnd)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="size-3.5" />
                              {cls.enrolledCount}/{cls.capacity} đã đăng ký
                            </span>
                            <span>
                              {Math.round(
                                (cls.enrolledCount / cls.capacity) * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (cls.enrolledCount / cls.capacity) * 100
                            }
                          />
                        </div>

                        {cls.schedules.length > 0 && (
                          <div className="space-y-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              Lịch học:
                            </span>
                            <ul className="space-y-0.5">
                              {cls.schedules
                                .slice(0, 3)
                                .map((schedule) => (
                                  <li
                                    key={schedule.id}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {dayjs(schedule.scheduledAt).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}{" "}
                                    ({schedule.durationMinutes} phút)
                                  </li>
                                ))}
                              {cls.schedules.length > 3 && (
                                <li className="text-xs text-muted-foreground">
                                  +{cls.schedules.length - 3} buổi khác
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="line-clamp-1">
                            {cls.locationDescription ||
                              cls.coachProfile.locationCity}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page - 1)
                        }}
                        className={
                          page <= 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => {
                      const p = i + 1
                      const isFirst = p === 1
                      const isLast = p === totalPages
                      const isNear =
                        p >= page - 1 && p <= page + 1
                      if (!isFirst && !isLast && !isNear) {
                        if (p === page - 2 || p === page + 2) {
                          return (
                            <PaginationItem key={p}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return null
                      }
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(p)
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page + 1)
                        }}
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
