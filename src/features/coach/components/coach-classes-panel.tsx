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
import { useTranslation } from "react-i18next"
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

const STATUS_TABS: { value: ClassStatus | "ALL" }[] = [
  { value: "ALL" },
  { value: "DRAFT" },
  { value: "OPEN" },
  { value: "FULL" },
  { value: "ONGOING" },
  { value: "COMPLETED" },
  { value: "CANCELLED" },
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

const LEVEL_OPTIONS = [
  { value: "Beginner" },
  { value: "Intermediate" },
  { value: "Advanced" },
  { value: "Pro" },
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
  const { t } = useTranslation("common")
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
            {cls.status === "DRAFT"
              ? t("coach.classes.status.draft")
              : cls.status === "OPEN"
                ? t("coach.classes.status.open")
                : cls.status === "FULL"
                  ? t("coach.classes.status.full")
                  : cls.status === "ONGOING"
                    ? t("coach.classes.status.ongoing")
                    : cls.status === "COMPLETED"
                      ? t("coach.classes.status.completed")
                      : t("coach.classes.status.cancelled")}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {cls.level || t("coach.classes.level.beginner")}
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
            {t("coach.classes.sessionsCount", { count: scheduleCount })} ·{" "}
            {formatDate(cls.startDate)} – {formatDate(cls.endDate)}
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
              <Send /> {t("coach.classes.publishButton")}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/coach/classes/${cls.id}`}>
                <Edit3 /> {t("coach.classes.editButton")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(cls.id)}
            >
              <XCircle /> {t("coach.classes.cancelButton")}
            </Button>
          </>
        )}
        {cls.status === "OPEN" && (
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/coach/classes/${cls.id}`}>
                <Edit3 /> {t("coach.classes.editButton")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(cls.id)}
            >
              <XCircle /> {t("coach.classes.cancelClassButton")}
            </Button>
          </>
        )}
        {cls.status === "ONGOING" && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/coach/classes/${cls.id}`}>
              <Eye /> {t("coach.classes.viewDetailButton")}
            </Link>
          </Button>
        )}
        {(cls.status === "COMPLETED" || cls.status === "CANCELLED") && (
          <Button size="sm" variant="outline" disabled>
            <Eye /> {t("coach.classes.viewDetailButton")}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export function CoachClassesPanel() {
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "ALL">("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)

  const { t } = useTranslation("common")
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
        toast.success(t("coach.classes.createSuccess"))
        setDialogOpen(false)
        form.reset()
        queryClient.invalidateQueries({ queryKey: coachQueryKeys.myClasses() })
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("coach.classes.createError")
        )
      },
    })
  }

  const handlePublish = (classId: string) => {
    publishClass.mutate(classId, {
      onSuccess: () => toast.success(t("coach.classes.publishSuccess")),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : t("coach.classes.publishError")
        ),
    })
  }

  const handleCancel = (classId: string) => {
    cancelClass.mutate(classId, {
      onSuccess: () => toast.success(t("coach.classes.cancelSuccess")),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : t("coach.classes.cancelError")
        ),
    })
  }

  if (isError) {
    return (
      <ErrorState
        title={t("coach.classes.errorTitle")}
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
              <Plus /> {t("coach.classes.createButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("coach.classes.createDialogTitle")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: t("coach.classes.titleRequired") }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("coach.classes.titleLabel")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("coach.classes.titlePlaceholder")}
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
                      <FormLabel>
                        {t("coach.classes.descriptionLabel")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t(
                            "coach.classes.descriptionPlaceholder"
                          )}
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
                        <FormLabel>{t("coach.classes.levelLabel")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? "Beginner"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t(
                                  "coach.classes.levelPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {LEVEL_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.value === "Beginner"
                                    ? t("coach.classes.level.beginner")
                                    : opt.value === "Intermediate"
                                      ? t("coach.classes.level.intermediate")
                                      : opt.value === "Advanced"
                                        ? t("coach.classes.level.advanced")
                                        : t("coach.classes.level.pro")}
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
                      required: t("coach.classes.capacityRequired"),
                      min: {
                        value: 1,
                        message: t("coach.classes.capacityMin"),
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("coach.classes.capacityLabel")} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t("coach.classes.capacityPlaceholder")}
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
                    required: t("coach.classes.priceRequired"),
                    min: { value: 0, message: t("coach.classes.priceInvalid") },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("coach.classes.priceLabel")} *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("coach.classes.pricePlaceholder")}
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
                      <FormLabel>{t("coach.classes.locationLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("coach.classes.locationPlaceholder")}
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
                      <FormLabel>
                        {t("coach.classes.coverImageLabel")}
                      </FormLabel>
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
                                toast.success(t("coach.classes.uploadSuccess"))
                              } catch {
                                toast.error(t("coach.classes.uploadError"))
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
                        <FormLabel>
                          {t("coach.classes.startDateLabel")}
                        </FormLabel>
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
                        <FormLabel>{t("coach.classes.endDateLabel")}</FormLabel>
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
                    {t("coach.classes.cancelButton")}
                  </Button>
                  <Button type="submit" disabled={createClass.isPending}>
                    {createClass.isPending
                      ? t("coach.classes.creating")
                      : t("coach.classes.createButton")}
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
          {STATUS_TABS.map((tabItem) => (
            <TabsTrigger
              key={tabItem.value}
              value={tabItem.value}
              className="sm:flex-none"
            >
              {tabItem.value === "DRAFT"
                ? t("coach.classes.status.draft")
                : tabItem.value === "OPEN"
                  ? t("coach.classes.status.open")
                  : tabItem.value === "FULL"
                    ? t("coach.classes.status.full")
                    : tabItem.value === "ONGOING"
                      ? t("coach.classes.status.ongoing")
                      : tabItem.value === "COMPLETED"
                        ? t("coach.classes.status.completed")
                        : tabItem.value === "CANCELLED"
                          ? t("coach.classes.status.cancelled")
                          : t("coach.classes.status.all")}
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
          <h3 className="text-lg font-semibold">
            {t("coach.classes.noClasses")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("coach.classes.noClassesDescription")}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus /> {t("coach.classes.createFirstClass")}
          </Button>
        </div>
      )}
    </div>
  )
}
