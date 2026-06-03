"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MapPin,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react"
import React, { useEffect,useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import type { PersonalEvent } from "../personal-calendar.mock";
import { getMockPersonalEvents } from "../personal-calendar.mock"

export function PersonalCalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  
  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [simulateError, setSimulateError] = useState(false)
  
  // Dialog state
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load mock data
  const allEvents = useMemo(() => getMockPersonalEvents(), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 450) // smooth skeleton transition
    return () => clearTimeout(timer)
  }, [currentDate])

  // Get date helper structures
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const gridDays = useMemo(() => {
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [gridStart, gridEnd])

  // Filter events that fall in the current selected month
  const currentMonthEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.startTime)
      return isSameMonth(eventDate, currentDate)
    })
  }, [allEvents, currentDate])

  // Group events by date key (yyyy-MM-dd)
  const groupedEvents = useMemo(() => {
    return allEvents.reduce<Record<string, PersonalEvent[]>>((acc, event) => {
      const dateKey = format(new Date(event.startTime), "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {})
  }, [allEvents])

  // Events of the selected day
  const selectedDayEvents = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return groupedEvents[dateKey] ?? []
  }, [selectedDate, groupedEvents])

  // Navigation handlers
  const handlePrevMonth = () => {
    setIsLoading(true)
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setIsLoading(true)
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  const handleGoToday = () => {
    const today = new Date()
    setIsLoading(true)
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const handleMonthChange = (monthIdx: string) => {
    setIsLoading(true)
    setCurrentDate((prev) => new Date(prev.getFullYear(), parseInt(monthIdx), 1))
  }

  const handleYearChange = (year: string) => {
    setIsLoading(true)
    setCurrentDate((prev) => new Date(parseInt(year), prev.getMonth(), 1))
  }

  // Open dialog detail view
  const handleOpenEventDetail = (event: PersonalEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  // Format date helper for localized headings
  const formattedMonthYear = format(currentDate, "MMMM yyyy")
  const vietnameseMonthYear = `Tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`

  // Year list generator (current year - 5 to current year + 5)
  const yearsList = useMemo(() => {
    const thisYear = new Date().getFullYear()
    const years = []
    for (let y = thisYear - 5; y <= thisYear + 5; y++) {
      years.push(y)
    }
    return years
  }, [])

  // Status Badge Class Generator
  const getStatusBadge = (status: PersonalEvent["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            Đã hoàn thành
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 animate-pulse">
            Đang diễn ra
          </Badge>
        )
      case "UPCOMING":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
            Sắp diễn ra
          </Badge>
        )
    }
  }

  // Event Type Icon/Badge Generator
  const getEventTypeBadge = (type: PersonalEvent["type"]) => {
    switch (type) {
      case "SOCIAL":
        return (
          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400 gap-1 font-normal">
            <span>🏓</span> Social
          </Badge>
        )
      case "BOOKING":
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400 gap-1 font-normal">
            <span>📅</span> Booking
          </Badge>
        )
      case "TOURNAMENT":
        return (
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400 gap-1 font-normal">
            <span>🏆</span> Tournament
          </Badge>
        )
    }
  }

  // Format ISO time to HH:MM
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const hrs = String(d.getHours()).padStart(2, "0")
      const mins = String(d.getMinutes()).padStart(2, "0")
      return `${hrs}:${mins}`
    } catch {
      return ""
    }
  }

  // Format ISO date to readable string
  const formatDateString = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return ""
    }
  }

  // Event item inside cell component
  const EventCellItem = ({ event }: { event: PersonalEvent }) => {
    const getDotColor = (status: PersonalEvent["status"]) => {
      if (status === "COMPLETED") return "bg-slate-400"
      if (status === "IN_PROGRESS") return "bg-blue-500"
      return "bg-emerald-500"
    }

    const typeEmoji = event.type === "SOCIAL" ? "🏓" : event.type === "BOOKING" ? "📅" : "🏆"

    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleOpenEventDetail(event)
        }}
        className="flex w-full items-center gap-1.5 rounded bg-muted/65 hover:bg-accent/80 px-1.5 py-1 text-left text-[11px] font-medium transition-all border border-border/40 hover:border-border truncate"
        title={`${event.title} (${event.location})`}
      >
        <span className={`shrink-0 size-1.5 rounded-full ${getDotColor(event.status)}`} />
        <span className="shrink-0">{typeEmoji}</span>
        <span className="truncate text-foreground/90">{event.title}</span>
      </button>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">Lịch của tôi</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Quản lý và theo dõi tất cả các hoạt động giao lưu, tập luyện và giải đấu pickleball cá nhân của bạn.
          </p>
        </div>

        {/* Developer Diagnostics Tool */}
        <div className="flex items-center gap-2 rounded-lg border bg-card p-2 text-xs">
          <span className="font-semibold text-muted-foreground">Chế độ Demo:</span>
          <Button
            variant={simulateError ? "destructive" : "outline"}
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => {
              setIsError(!isError)
              setSimulateError(!simulateError)
            }}
          >
            {simulateError ? "Tắt Lỗi" : "Mô phỏng Lỗi"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold">Lỗi tải dữ liệu lịch trình</AlertTitle>
          <AlertDescription className="mt-1 space-y-2">
            <p>Hệ thống không thể tải danh sách sự kiện cá nhân vào lúc này. Vui lòng thử lại sau.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => {
                setIsError(false)
                setSimulateError(false)
              }}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Controls toolbar */}
          <Card className="shadow-sm border-border bg-card/65 backdrop-blur-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Month Dropdown Selector */}
                <Select
                  value={String(currentDate.getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[125px] bg-background">
                    <SelectValue placeholder="Chọn tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Dropdown Selector */}
                <Select
                  value={String(currentDate.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-[100px] bg-background">
                    <SelectValue placeholder="Chọn năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsList.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Năm {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Today button */}
                <Button
                  variant="outline"
                  onClick={handleGoToday}
                  className="bg-background shadow-xs hover:bg-accent/50"
                >
                  Hôm nay
                </Button>
              </div>

              {/* Center navigation controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="size-9 rounded-full bg-background"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <h2 className="text-base font-bold min-w-[170px] text-center select-none uppercase tracking-wide text-foreground">
                  {vietnameseMonthYear}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="size-9 rounded-full bg-background"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Layout Grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Calendar Card */}
            <Card className="shadow-md border-border overflow-hidden bg-card">
              <CardHeader className="bg-muted/15 border-b pb-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CalendarDays className="size-5" />
                  <span>Xem lịch dạng ô</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {/* Calendar grid weekday header */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground border-b pb-3 mb-2">
                  <span>Thứ 2</span>
                  <span>Thứ 3</span>
                  <span>Thứ 4</span>
                  <span>Thứ 5</span>
                  <span>Thứ 6</span>
                  <span>Thứ 7</span>
                  <span className="text-red-500">Chủ nhật</span>
                </div>

                {/* Grid cells */}
                {isLoading ? (
                  /* Loading skeleton grid */
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="min-h-28 rounded-lg border border-border/60 p-2 space-y-2">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {gridDays.map((day) => {
                      const dateKey = format(day, "yyyy-MM-dd")
                      const dayEvents = groupedEvents[dateKey] ?? []
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isSelected = isSameDay(day, selectedDate)
                      const isToday = isSameDay(day, new Date())

                      return (
                        <div
                          key={dateKey}
                          onClick={() => setSelectedDate(day)}
                          className={`min-h-28 rounded-lg border p-2 text-left cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                            isSelected
                              ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                              : "border-border/60 bg-card hover:bg-accent/40 hover:border-border"
                          } ${!isCurrentMonth ? "opacity-35 hover:opacity-75" : ""}`}
                        >
                          {/* Day header: number and today indicator */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold size-6 flex items-center justify-center rounded-full transition-colors ${
                                isToday
                                  ? "bg-primary text-primary-foreground font-black shadow-xs ring-4 ring-primary/10"
                                  : "text-foreground"
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            {dayEvents.length > 0 && (
                              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] scale-90 opacity-80">
                                {dayEvents.length}
                              </Badge>
                            )}
                          </div>

                          {/* Event list container */}
                          <div className="mt-2 space-y-1.5 flex-1 flex flex-col justify-start">
                            {dayEvents.slice(0, 2).map((event) => (
                              <EventCellItem key={event.id} event={event} />
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] font-semibold text-muted-foreground pl-1 mt-1">
                                +{dayEvents.length - 2} hoạt động khác
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar daily agenda panel */}
            <Card className="shadow-md border-border bg-card flex flex-col">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  Chi tiết ngày {format(selectedDate, "dd/MM/yyyy")}
                </CardTitle>
                <CardDescription className="text-xs">
                  Danh sách hoạt động bạn đã đăng ký tham gia trong ngày này.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                {selectedDayEvents.length === 0 ? (
                  /* Empty state for the selected day */
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed rounded-xl bg-muted/20">
                    <span className="text-3xl mb-2">🍃</span>
                    <p className="text-sm font-semibold text-foreground/80">Không có hoạt động</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      Bạn không có lịch social, đặt sân hay giải đấu nào trong ngày này.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Có {selectedDayEvents.length} hoạt động
                    </p>
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {selectedDayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleOpenEventDetail(event)}
                          className="group relative flex flex-col gap-2 rounded-lg border border-border/80 bg-background/50 hover:bg-accent/40 p-3 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {event.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>

                          <div className="mt-1 flex items-center justify-between border-t pt-2 border-border/40">
                            {getEventTypeBadge(event.type)}
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {event.participantsCount} người tham gia
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Month Empty State */}
          {currentMonthEvents.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed bg-card/40 animate-in fade-in duration-300">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-8 ring-primary/5">
                <CalendarDays className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Bạn chưa có hoạt động nào</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Hiện tại bạn chưa đăng ký tham gia bất kỳ buổi social, đặt sân cá nhân hay giải đấu nào trong {vietnameseMonthYear.toLowerCase()}.
              </p>
            </div>
          )}
        </>
      )}

      {/* Event detail modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px] rounded-xl overflow-hidden border border-border bg-card shadow-2xl p-0 animate-in fade-in duration-200">
          <div className="relative h-2.5 w-full bg-primary" />
          
          {selectedEvent && (
            <div className="p-6 space-y-5">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {getEventTypeBadge(selectedEvent.type)}
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground leading-snug">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="size-3.5 text-primary" />
                  Chi tiết lịch hoạt động cá nhân của bạn
                </DialogDescription>
              </DialogHeader>

              <Separator className="bg-border/60" />

              {/* Details table / grid */}
              <div className="space-y-4 text-sm">
                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground mt-0.5">
                    <Clock className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Thời gian
                    </p>
                    <p className="font-bold text-foreground/90">
                      {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateString(selectedEvent.startTime)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground mt-0.5">
                    <MapPin className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Địa điểm
                    </p>
                    <p className="font-medium text-foreground/95 leading-relaxed">
                      {selectedEvent.location}
                    </p>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground mt-0.5">
                    <User className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Người tổ chức
                    </p>
                    <p className="font-semibold text-foreground/90">
                      {selectedEvent.organizer}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground mt-0.5">
                    <Users className="size-4 text-primary/80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Số người tham gia
                    </p>
                    <p className="font-semibold text-foreground/90">
                      {selectedEvent.participantsCount} người đã tham gia
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Description */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Mô tả hoạt động
                </h5>
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-lg p-3 border border-border/30">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Modal footer close button */}
              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
