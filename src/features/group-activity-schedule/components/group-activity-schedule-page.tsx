"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format, startOfMonth } from "date-fns"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  socialQueryKeys,
  useSocialListQuery,
} from "@/features/socials/api/social-queries"
import { SocialForm } from "@/features/socials/components/Social"
import type { Social } from "@/features/socials/types"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { GroupActivityCalendarView } from "./group-activity-calendar-view"

interface GroupActivitySchedulePageProps {
  initialGroupId?: string
  embedded?: boolean
}

function getStatusBadgeClass(status: Social["status"]) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-700 border-emerald-200"
  if (status === "COMPLETED") return "bg-slate-100 text-slate-700 border-slate-200"
  if (status === "CANCELLED") return "bg-rose-100 text-rose-700 border-rose-200"
  return "bg-amber-100 text-amber-700 border-amber-200"
}

function normalizeSocialsByDate(socials: Social[]) {
  return socials.reduce<Record<string, Social[]>>((accumulator, social) => {
    if (!social.startTime) return accumulator
    const key = format(new Date(social.startTime), "yyyy-MM-dd")
    if (!accumulator[key]) accumulator[key] = []
    accumulator[key].push(social)
    return accumulator
  }, {})
}

function formatSocialTime(social: Social) {
  if (!social.startTime || !social.endTime) return "Chưa có lịch"
  return `${format(new Date(social.startTime), "HH:mm")} - ${format(new Date(social.endTime), "HH:mm")}`
}

export function GroupActivitySchedulePage({ initialGroupId, embedded = false }: GroupActivitySchedulePageProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<"month" | "week" | "agenda">("month")
  const [createOpen, setCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState(() => ({
    groupId: initialGroupId ?? "",
    title: "",
    note: "",
    format: "SOCIAL" as const,
    startTime: `${format(new Date(), "yyyy-MM-dd")}T19:00`,
    endTime: `${format(new Date(), "yyyy-MM-dd")}T21:00`,
    maxSlots: 24,
  }))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999)

  const queryParams = useMemo(
    () => ({
      groupId: initialGroupId,
      sortBy: "startTime" as const,
      order: "asc" as const,
      startFrom: monthStart.toISOString(),
      startTo: monthEnd.toISOString(),
      limit: 100,
    }),
    [initialGroupId, monthStart, monthEnd]
  )

  const { data, isLoading, isError } = useSocialListQuery(queryParams)
  const socials = data?.data ?? []
  const socialsByDate = useMemo(() => normalizeSocialsByDate(socials), [socials])

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd")
  const selectedDaySocials = socialsByDate[selectedDateKey] ?? []

  function openCreateDialogForDate(date: Date) {
    setSelectedDate(date)
    setCreateInitialValues({
      groupId: initialGroupId ?? "",
      title: "",
      note: "",
      format: "SOCIAL",
      startTime: `${format(date, "yyyy-MM-dd")}T19:00`,
      endTime: `${format(date, "yyyy-MM-dd")}T21:00`,
      maxSlots: 24,
    })
    setCreateOpen(true)
  }

  async function handleCreatedSocial(createdSocial: Social) {
    await queryClient.invalidateQueries({ queryKey: socialQueryKeys.list(queryParams) })
    setCreateOpen(false)
    if (createdSocial.startTime) {
      setSelectedDate(new Date(createdSocial.startTime))
    }
  }

  const content = (
    <div className={embedded ? "space-y-6" : "space-y-6 pb-8"}>
      {!embedded && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("calendar.title")}</h1>
          <p className="text-muted-foreground">{t("calendar.subtitle")}</p>
        </div>
      )}

      <Card className="p-0">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          {/* Month select */}
          <Select
            value={String(currentMonth.getMonth())}
            onValueChange={(value) =>
              setCurrentMonth((prev) => new Date(prev.getFullYear(), Number(value), 1))
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder={`Tháng ${currentMonth.getMonth() + 1}`} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => (
                <SelectItem key={i} value={String(i)}>
                  Tháng {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year combobox (editable) */}
          <Combobox
            value={String(currentMonth.getFullYear())}
            onValueChange={(value: string | null, _eventDetails) => {
              // Accept free text years; validate below. Ignore null/empty.
              if (value == null || value === "") return
              const num = Number(value)
              if (!Number.isNaN(num) && Number.isFinite(num) && num >= 1 && num <= 9999) {
                setCurrentMonth((prev) => new Date(num, prev.getMonth(), 1))
              }
            }}
          >
            <ComboboxInput
              className="w-24"
              placeholder={String(currentMonth.getFullYear())}
              showTrigger
            />
            <ComboboxContent>
              <ComboboxList>
                {(() => {
                  const thisYear = new Date().getFullYear()
                  const startYear = Math.max(1900, thisYear - 5)
                  const endYear = thisYear + 5
                  return Array.from({ length: endYear - startYear + 1 }).map((_, idx) => {
                    const y = startYear + idx
                    return (
                      <ComboboxItem key={y} value={String(y)}>
                        {y}
                      </ComboboxItem>
                    )
                  })
                })()}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Button
            variant="outline"
            onClick={() => {
              const now = new Date()
              setCurrentMonth(startOfMonth(now))
              setSelectedDate(now)
            }}
          >
            {t("calendar.today")}
          </Button>

          <Button
            className="ml-auto"
            onClick={() => openCreateDialogForDate(selectedDate)}
            disabled={!initialGroupId}
          >
            <Plus className="mr-2 size-4" />
            {t("calendar.createSocial")}
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="text-sm text-destructive">{t("common.error")}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <GroupActivityCalendarView
            socials={socials}
            baseDate={currentMonth}
            view={view}
            selectedDate={selectedDate}
            onViewChange={setView}
            onSelectDate={setSelectedDate}
            onOpenSocial={(social) => {
              if (social.startTime) {
                setSelectedDate(new Date(social.startTime))
              }
            }}
          />

          <Card className="p-0">
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("calendar.selectedDateLabel", { date: format(selectedDate, "dd/MM/yyyy") })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("calendar.selectedDateCount", { count: selectedDaySocials.length })}
                </p>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => openCreateDialogForDate(selectedDate)}
                disabled={!initialGroupId}
              >
                <Plus className="mr-2 size-4" />
                {t("calendar.createSocialForSelectedDate")}
              </Button>

              {selectedDaySocials.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {t("calendar.noSocialInDay")}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDaySocials
                    .slice()
                    .sort((a, b) => {
                      const left = a.startTime ? new Date(a.startTime).getTime() : 0
                      const right = b.startTime ? new Date(b.startTime).getTime() : 0
                      return left - right
                    })
                    .map((social) => (
                      <div key={social.id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-semibold">{social.title}</p>
                          <Badge variant="outline" className={getStatusBadgeClass(social.status)}>
                            {social.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatSocialTime(social)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {social.joinedCount}/{social.maxSlots} người tham gia • còn {Math.max(social.maxSlots - social.joinedCount, 0)} {t("calendar.slots")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t("calendar.createSocial")}</DialogTitle>
            <DialogDescription>{t("calendar.createSocialDescription")}</DialogDescription>
          </DialogHeader>

          <SocialForm
            compact
            initialFormData={createInitialValues}
            redirectOnSuccess={false}
            invalidateQueriesOnSuccess={false}
            showPlaySessions={false}
            onCreated={handleCreatedSocial}
          />
        </DialogContent>
      </Dialog>
    </div>
  )

  return embedded ? content : <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{content}</div>
}

export default function Page() {
  return <GroupActivitySchedulePage />
}
