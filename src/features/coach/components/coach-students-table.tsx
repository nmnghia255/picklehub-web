"use client"

import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { ErrorState } from "@/components/shared/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useSession } from "@/features/auth/hooks/use-session"
import { getErrorMessage } from "@/lib/api-client"

import { useCoachLearners } from "../hooks/use-coach-queries"

const DEFAULT_LIMIT = 12

export function CoachStudentsTable({
  onSelect,
}: {
  onSelect?: (learnerId: string) => void
}) {
  const { t } = useTranslation("common")
  const session = useSession()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [kind, setKind] = useState("all")
  const [page, setPage] = useState(1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const params: {
    search?: string
    kind?: string
    page?: number
    limit?: number
  } = {
    page,
    limit: DEFAULT_LIMIT,
  }
  if (debouncedSearch) params.search = debouncedSearch
  if (kind !== "all") params.kind = kind

  const { data, isLoading, isError, error, refetch } = useCoachLearners(
    params,
    { enabled: !!session?.user }
  )

  if (isError) {
    return (
      <ErrorState
        title={t("coach.students.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  const students = data?.data ?? []
  const pagination = data?.pagination

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("coach.students.searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <Select
          value={kind}
          onValueChange={(value) => {
            setKind(value)
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("coach.students.kindAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("coach.students.kindAll")}</SelectItem>
            <SelectItem value="class">
              {t("coach.students.kindClass")}
            </SelectItem>
            <SelectItem value="booking">
              {t("coach.students.kindBooking")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {students.map((student) => (
          <Card key={student.id} className="rounded-2xl border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12">
                    <AvatarImage
                      src={student.avatarUrl ?? ""}
                      alt={student.name ?? t("coach.students.viewProfile")}
                    />
                    <AvatarFallback>
                      {student?.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <p className="font-semibold">
                      {student.name ?? t("coach.students.noName")}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>
                        {t("coach.students.classesAttended", {
                          count: student.classEnrollmentCount,
                        })}
                      </span>
                      <span>
                        {t("coach.students.activeClasses", {
                          count: student.activeClassEnrollmentCount,
                        })}
                      </span>
                      <span>
                        {t("coach.students.privateBookings", {
                          count: student.privateBookingCount,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.email ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => onSelect?.(student.id)}
                  >
                    {t("coach.students.viewProfile")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("coach.students.noResults")}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }}
                className={
                  page >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
