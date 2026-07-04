"use client"

import { BadgeCheck,MapPin, Shield, Star } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CoachDiscoveryDetail } from "@/features/coach/components/coach-discovery-detail"
import { useCoachList } from "@/features/coach/hooks/use-coach-queries"
import type { CoachProfileSummary, DiscoveryTabValue } from "@/features/coach/types/coach"
import { getErrorMessage } from "@/lib/api-client"

const LEVEL_OPTIONS = [
  { value: "all", label: "Tất cả trình độ" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Pro", label: "Pro" },
] as const

const PAGE_LIMIT = 12

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

function levelBadgeVariant(level: CoachProfileSummary["level"]) {
  switch (level) {
    case "Pro":
      return "default" as const
    case "Advanced":
      return "secondary" as const
    case "Intermediate":
      return "outline" as const
    case "Beginner":
      return "ghost" as const
  }
}

function verificationBadge(status: CoachProfileSummary["verificationStatus"]) {
  switch (status) {
    case "VERIFIED":
      return { icon: BadgeCheck, label: "Đã xác thực", variant: "default" as const }
    case "PENDING":
      return { icon: Shield, label: "Chờ xác thực", variant: "outline" as const }
    case "REJECTED":
      return { icon: Shield, label: "Từ chối", variant: "destructive" as const }
    default:
      return { icon: Shield, label: "Chưa xác thực", variant: "ghost" as const }
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount)
}

function CoachCard({
  coach,
  onSelect,
}: {
  coach: CoachProfileSummary
  onSelect: (id: string) => void
}) {
  const verification = verificationBadge(coach.verificationStatus)
  const VerifIcon = verification.icon

  return (
    <button onClick={() => onSelect(coach.id)} className="block w-full text-left">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
              <AvatarFallback>{coach.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{coach.displayName}</p>
              <div className="flex items-center gap-1.5">
                <Badge variant={levelBadgeVariant(coach.level)} className="text-[10px]">
                  {coach.level}
                </Badge>
                <Badge variant={verification.variant} className="gap-0.5 text-[10px]">
                  <VerifIcon className="size-2.5" />
                  {verification.label}
                </Badge>
              </div>
            </div>
          </div>
          {coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {coach.specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
              ))}
              {coach.specialties.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{coach.specialties.length - 3}</span>
              )}
            </div>
          )}
          {coach.locationCity && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              <span className="truncate">{coach.locationCity}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <StarRating rating={coach.averageRating} />
            <span className="text-xs text-muted-foreground">
              {coach.averageRating.toFixed(1)} ({coach.reviewCount})
            </span>
          </div>
          <div className="mt-auto">
            <p className="text-sm font-bold text-primary">
              {formatCurrency(coach.hourlyRateVnd)}₫
              <span className="text-xs font-normal text-muted-foreground"> /giờ</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function CoachCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

export function CoachDiscoveryPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const scrollYRef = useRef(0)

  const view = searchParams.get("view") || "list"
  const selectedCoachId = searchParams.get("coachId") || ""
  const tabFromUrl = searchParams.get("tab") || "overview"
  const cityFromUrl = searchParams.get("city") || ""
  const levelFromUrl = searchParams.get("level") || "all"
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10)

  const [city, setCity] = useState(cityFromUrl)
  const [debouncedCity, setDebouncedCity] = useState(cityFromUrl)
  const [level, setLevel] = useState(levelFromUrl)
  const [page, setPage] = useState(pageFromUrl)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [city])

  const { data, isLoading, isError, error, refetch } = useCoachList({
    city: debouncedCity || undefined,
    level: level === "all" ? undefined : level,
    page,
    limit: PAGE_LIMIT,
  })

  const coaches = data?.data ?? []
  const pagination = data?.pagination

  const updateUrl = useCallback((params: Record<string, string | undefined>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        p.delete(key)
      } else {
        p.set(key, value)
      }
    })
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const handleSelectCoach = useCallback((coachId: string) => {
    scrollYRef.current = window.scrollY
    const p = new URLSearchParams(searchParams.toString())
    p.set("view", "detail")
    p.set("coachId", coachId)
    p.set("tab", "overview")
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const handleBack = useCallback(() => {
    router.back()
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollYRef.current)
    })
  }, [router])

  const handleLevelChange = useCallback((value: string) => {
    setLevel(value)
    setPage(1)
    updateUrl({ level: value === "all" ? undefined : value, page: "1" })
  }, [updateUrl])

  const handleCityChange = useCallback((value: string) => {
    setCity(value)
  }, [])

  const clearFilters = useCallback(() => {
    setCity("")
    setDebouncedCity("")
    setLevel("all")
    setPage(1)
    updateUrl({ city: undefined, level: undefined, page: undefined })
  }, [updateUrl])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    updateUrl({ page: String(newPage) })
  }, [updateUrl])

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách HLV"
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  const hasFilters = debouncedCity || level

  if (view === "detail" && selectedCoachId) {
    return (
      <CoachDiscoveryDetail
        coachId={selectedCoachId}
        onBack={handleBack}
        defaultTab={tabFromUrl as DiscoveryTabValue}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Thành phố</label>
          <Input
            placeholder="Nhập thành phố..."
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-48">
          <label className="text-xs font-medium text-muted-foreground">Trình độ</label>
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả trình độ" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="shrink-0" onClick={clearFilters}>
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CoachCardSkeleton key={i} />
          ))}
        </div>
      ) : coaches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">Không tìm thấy huấn luyện viên nào</p>
          <p className="mt-1 text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach, idx) => (
              <CoachCard key={coach.id ?? `coach-${idx}`} coach={coach} onSelect={handleSelectCoach} />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pageNum = i + 1
                  const isFirst = pageNum === 1
                  const isLast = pageNum === pagination.totalPages
                  const isNear = Math.abs(pageNum - page) <= 1
                  if (!isFirst && !isLast && !isNear) {
                    if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink onClick={() => handlePageChange(pageNum)} className="cursor-pointer">
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === page - 3 || pageNum === page + 3) {
                      return (
                        <PaginationItem key={pageNum}>
                          <span className="flex size-9 items-center justify-center text-sm text-muted-foreground">...</span>
                        </PaginationItem>
                      )
                    }
                    return null
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => handlePageChange(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))}
                    className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}

export function CoachDiscoveryPage() {
  return (
    <Suspense fallback={null}>
      <CoachDiscoveryPageContent />
    </Suspense>
  )
}
