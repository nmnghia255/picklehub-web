"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  CalendarDays,
  DollarSign,
  Edit3,
  Eye,
  Plus,
  Send,
  Users,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { ErrorState } from "@/components/shared/error-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"
import { CoachMediaService } from "@/features/coach/api/media-service"
import { coachQueryKeys } from "@/features/coach/api/query-keys"
import {
  useCancelClass,
  useCreateClass,
  useMyClasses,
  usePublishClass,
} from "@/features/coach/hooks/use-coach-queries"
import type {
  ClassStatus,
  CoachClass,
  CreateCoachClassDto,
} from "@/features/coach/types/coach"
import { getErrorMessage } from "@/lib/api-client"

const STATUS_TABS: { label: string; value: ClassStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Đang mở", value: "OPEN" },
  { label: "Đã đầy", value: "FULL" },
  { label: "Đang diễn ra", value: "ONGOING" },
  { label: "Đã kết thúc", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
]

const STATUS_BADGE: Record<
  ClassStatus,
  {
    variant: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
> = {
  DRAFT: { variant: "secondary" },
  OPEN: { variant: "default", className: "bg-blue-600 hover:bg-blue-600/80" },
  FULL: {
    variant: "secondary",
    className: "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30",
  },
  ONGOING: { variant: "default", className: "bg-sky-600 hover:bg-sky-600/80" },
  COMPLETED: {
    variant: "secondary",
    className: "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30",
  },
  CANCELLED: { variant: "outline" },
}

const STATUS_LABEL: Record<ClassStatus, string> = {
  DRAFT: "Bản nháp",
  OPEN: "Đang mở",
  FULL: "Đã đầy",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

const LEVEL_OPTIONS = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
  { label: "Pro", value: "Pro" },
]

function formatPrice(vnd: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(vnd)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—"
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr))
}

function ClassCard({
  cls,
  onPublish,
  onCancel,
}: {
  cls: CoachClass
  onPublish: (id: string) => void
  onCancel: (id: string) => void
}) {
  const badgeConfig = STATUS_BADGE[cls.status]
  const scheduleCount = cls.schedules?.length ?? 0

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{cls.title}</CardTitle>
          <Badge
            variant={badgeConfig.variant}
            className={badgeConfig.className}
          >
            {STATUS_LABEL[cls.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {cls.level || "N/A"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span className="flex-1">
            {cls.enrolledCount ?? cls._count?.enrollments ?? 0} / {cls.capacity}
          </span>
        </div>
        <Progress
          value={
            ((cls.enrolledCount ?? cls._count?.enrollments ?? 0) /
              cls.capacity) *
            100
          }
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="size-4" />
          <span>{formatPrice(cls.priceVnd)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>
            {scheduleCount} buổi · {formatDate(cls.startDate)} –{" "}
            {formatDate(cls.endDate)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        {cls.status === "DRAFT" && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => onPublish(cls.id)}
            >
              <Send /> Xuất bản
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/coach/classes/${cls.id}`}>
                <Edit3 /> Chỉnh sửa
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(cls.id)}
            >
              <XCircle /> Hủy
            </Button>
          </>
        )}
        {cls.status === "OPEN" && (
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/coach/classes/${cls.id}`}>
                <Edit3 /> Chỉnh sửa
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(cls.id)}
            >
              <XCircle /> Hủy lớp
            </Button>
          </>
        )}
        {cls.status === "ONGOING" && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/coach/classes/${cls.id}`}>
              <Eye /> Xem chi tiết
            </Link>
          </Button>
        )}
        {(cls.status === "COMPLETED" || cls.status === "CANCELLED") && (
          <Button size="sm" variant="outline" disabled>
            <Eye /> Xem chi tiết
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export function CoachClassesPanel() {
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "ALL">("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)

  const session = useSession()
  const queryClient = useQueryClient()
  const {
    data: classes,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyClasses(
    statusFilter === "ALL" ? undefined : { status: statusFilter },
    { enabled: !!session?.user }
  )
  const createClass = useCreateClass()
  const publishClass = usePublishClass()
  const cancelClass = useCancelClass()

  const form = useForm<CreateCoachClassDto>({
    defaultValues: {
      title: "",
      description: "",
      capacity: 0,
      priceVnd: 0,
      locationDescription: "",
      coverImageUrl: "",
      startDate: "",
      endDate: "",
      level: "Beginner",
    },
  })

  const onCreateSubmit = (values: CreateCoachClassDto) => {
    // Log raw form values for debugging
    console.log("[CreateClass] raw form values:", values)

    // Normalize payload before sending:
    // - Backend rejects empty strings for optional fields (e.g. startDate: "" → 500)
    // - Remove undefined keys so JSON.stringify omits them
    const payload = { ...values }
    if (!payload.description) delete payload.description
    if (!payload.locationDescription) delete payload.locationDescription
    if (!payload.coverImageUrl) delete payload.coverImageUrl
    if (!payload.startDate) delete payload.startDate
    if (!payload.endDate) delete payload.endDate
    if (!payload.level) delete payload.level

    console.log("[CreateClass] normalized payload:", payload)

    createClass.mutate(payload, {
      onSuccess: () => {
        toast.success("Tạo lớp học thành công")
        setDialogOpen(false)
        form.reset()
        queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Tạo lớp thất bại")
      },
    })
  }

  const handlePublish = (classId: string) => {
    publishClass.mutate(classId, {
      onSuccess: () => toast.success("Đã xuất bản lớp học"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Xuất bản thất bại"),
    })
  }

  const handleCancel = (classId: string) => {
    cancelClass.mutate(classId, {
      onSuccess: () => toast.success("Đã hủy lớp học"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Hủy lớp thất bại"),
    })
  }

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách lớp học"
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Tạo lớp học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Tiêu đề không được để trống" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Pickleball cơ bản"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả về lớp học..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cấp độ</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? "Beginner"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn cấp độ" />
                            </SelectTrigger>
                            <SelectContent>
                              {LEVEL_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    rules={{
                      required: "Số lượng không được để trống",
                      min: { value: 1, message: "Tối thiểu 1 học viên" },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ví dụ: 10"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber
                              field.onChange(Number.isNaN(val) ? 0 : val)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="priceVnd"
                  rules={{
                    required: "Giá không được để trống",
                    min: { value: 0, message: "Giá không hợp lệ" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ví dụ: 500000"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = e.target.valueAsNumber
                            field.onChange(Number.isNaN(val) ? 0 : val)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa điểm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Sân PickleHub Quận 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh bìa</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {field.value && (
                            <div className="relative overflow-hidden rounded-lg border">
                              <img
                                src={field.value}
                                alt="Preview"
                                className="h-40 w-full object-cover"
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const url =
                                  await CoachMediaService.uploadImage(file)
                                field.onChange(url)
                                toast.success("Tải ảnh lên thành công")
                              } catch {
                                toast.error("Tải ảnh lên thất bại")
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createClass.isPending}>
                    {createClass.isPending ? "Đang tạo..." : "Tạo lớp"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as ClassStatus | "ALL")}
        className="w-full gap-6"
      >
        <TabsList
          variant="line"
          className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1"
        >
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="sm:flex-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, index) => (
            <ClassCard
              key={cls.id ?? index}
              cls={cls}
              onPublish={handlePublish}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="rounded-full bg-muted p-4">
            <CalendarDays className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Chưa có lớp học nào</h3>
          <p className="text-sm text-muted-foreground">Tạo lớp học đầu tiên!</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus /> Tạo lớp học mới
          </Button>
        </div>
      )}
    </div>
  )
}
