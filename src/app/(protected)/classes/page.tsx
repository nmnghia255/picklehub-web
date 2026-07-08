"use client"

import dayjs from "dayjs"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useDiscoverClasses } from "@/features/coach/hooks/use-coach-queries"
import { getErrorMessage } from "@/lib/api-client"

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"] as const

const levelBadgeVariant: Record<
  string,
  "secondary" | "default" | "outline" | "destructive"
> = {
  Beginner: "secondary",
  Intermediate: "default",
  Advanced: "outline",
  Pro: "destructive",
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

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function formatPrice(price: number, locale: string) {
  return `${new Intl.NumberFormat(locale).format(price)} ₫`
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
  const { t, i18n } = useTranslation("common")
  const locale = getLocaleCode(i18n.language)
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

  const { data, isLoading, isError, error, refetch } =
    useDiscoverClasses(params)

  const classes = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 0

  const levelLabel: Record<string, string> = {
    Beginner: t("learner.classes.level.beginner"),
    Intermediate: t("learner.classes.level.intermediate"),
    Advanced: t("learner.classes.level.advanced"),
    Pro: t("learner.classes.level.pro"),
  }

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    },
    [totalPages]
  )

  if (isError) {
    return (
      <ErrorState
        title={t("learner.classes.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  return (
    <PageContainer className="space-y-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("learner.classes.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("learner.classes.pageDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("learner.classes.filters.cityLabel")}
            </label>
            <Input
              placeholder={t("learner.classes.filters.cityPlaceholder")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("learner.classes.filters.levelLabel")}
            </label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("learner.classes.filters.levelPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("learner.classes.filters.allLevels")}
                </SelectItem>
                {LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {levelLabel[lvl]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("learner.classes.filters.fromDate")}
            </label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("learner.classes.filters.toDate")}
            </label>
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
                {t("learner.classes.empty")}
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
                          className="absolute top-2 right-2"
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
                          {formatPrice(cls.priceVnd, locale)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="size-3.5" />
                              {t("learner.classes.enrolledCount", {
                                enrolled: cls.enrolledCount,
                                capacity: cls.capacity,
                              })}
                            </span>
                            <span>
                              {Math.round(
                                (cls.enrolledCount / cls.capacity) * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={(cls.enrolledCount / cls.capacity) * 100}
                          />
                        </div>

                        {cls.schedules.length > 0 && (
                          <div className="space-y-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {t("learner.classes.scheduleLabel")}
                            </span>
                            <ul className="space-y-0.5">
                              {cls.schedules.slice(0, 3).map((schedule) => (
                                <li
                                  key={schedule.id}
                                  className="text-xs text-muted-foreground"
                                >
                                  {dayjs(schedule.scheduledAt).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}{" "}
                                  (
                                  {t("learner.classes.minutes", {
                                    count: schedule.durationMinutes,
                                  })}
                                  )
                                </li>
                              ))}
                              {cls.schedules.length > 3 && (
                                <li className="text-xs text-muted-foreground">
                                  {t("learner.classes.moreSessions", {
                                    count: cls.schedules.length - 3,
                                  })}
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
                      const isNear = p >= page - 1 && p <= page + 1
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
