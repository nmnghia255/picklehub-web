"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Banknote, Calendar, Clock, MapPin, Shield, Users } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { BackNavigation } from "@/components/common/back-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CoachClient } from "@/features/coach/api/coach-client"
import { coachQueryKeys } from "@/features/coach/api/query-keys"
import { useClassDetail } from "@/features/coach/hooks/use-coach-queries"
import { useMyEnrollments } from "@/features/learner/hooks/use-learner-queries"

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  OPEN: "default",
  FULL: "secondary",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num
  return "****" + num.slice(-4)
}

async function fetchSession() {
  try {
    const response = await fetch("/api/auth/session")

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

function ClassDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function ClassDetailPage() {
  const params = useParams()
  const classId = params.classId as string
  const { t } = useTranslation("common")
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  })

  const [showBankDialog, setShowBankDialog] = useState(false)
  const [bankInfo, setBankInfo] = useState<{
    bankName: string
    bankAccountNumber: string
    bankAccountName: string
  } | null>(null)

  const { data: classData, isLoading, isError } = useClassDetail(classId)
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useMyEnrollments({
      enabled: !!session?.user,
    })

  const currentEnrollment = enrollments?.find(
    (enrollment) =>
      enrollment.classId === classId && enrollment.status !== "CANCELLED"
  )

  const queryClient = useQueryClient()
  const enrollMutation = useMutation({
    mutationFn: () => CoachClient.enrollInClass(classId),
    onSuccess: (enrollment) => {
      const info = enrollment.coachPaymentInfo
      if (info) {
        setBankInfo({
          bankName: info.paymentBankName,
          bankAccountNumber: info.paymentAccountNumber,
          bankAccountName: info.paymentAccountName,
        })
        setShowBankDialog(true)
      }
      queryClient.invalidateQueries({
        queryKey: coachQueryKeys.classDetail(classId),
      })
      queryClient.invalidateQueries({ queryKey: ["learner", "enrollments"] })
      toast.success(t("learner.classDetail.enrollSuccess"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("learner.classDetail.enrollError"))
    },
  })

  if (isLoading) return <ClassDetailSkeleton />

  if (isError || !classData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">
          {t("learner.classDetail.notFound")}
        </p>
      </div>
    )
  }

  const {
    title,
    description,
    level,
    status,
    coverImageUrl,
    capacity,
    enrolledCount,
    priceVnd,
    locationDescription,
    schedules,
    coachProfile,
  } = classData

  const spotsLeft = capacity - enrolledCount
  const isOpen = status === "OPEN"
  const isFull = status === "FULL" || spotsLeft <= 0
  const canEnroll = isOpen && !isFull
  const showEnrollmentAction =
    !isSessionLoading && (!isLoadingEnrollments || !session?.user)

  const levelLabel: Record<string, string> = {
    Beginner: t("learner.classDetail.level.beginner"),
    Intermediate: t("learner.classDetail.level.intermediate"),
    Advanced: t("learner.classDetail.level.advanced"),
    Pro: t("learner.classDetail.level.pro"),
  }

  const statusLabel: Record<string, string> = {
    DRAFT: t("learner.classDetail.status.draft"),
    OPEN: t("learner.classDetail.status.open"),
    FULL: t("learner.classDetail.status.full"),
    ONGOING: t("learner.classDetail.status.ongoing"),
    COMPLETED: t("learner.classDetail.status.completed"),
    CANCELLED: t("learner.classDetail.status.cancelled"),
  }

  const verificationLabel: Record<string, string> = {
    UNVERIFIED: t("learner.classDetail.verification.unverified"),
    PENDING: t("learner.classDetail.verification.pending"),
    VERIFIED: t("learner.classDetail.verification.verified"),
    REJECTED: t("learner.classDetail.verification.rejected"),
  }

  const enrollmentStatusLabel: Record<string, string> = {
    ACTIVE: t("learner.classDetail.enrollmentStatus.active"),
    COMPLETED: t("learner.classDetail.enrollmentStatus.completed"),
    CANCELLED: t("learner.classDetail.enrollmentStatus.cancelled"),
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <BackNavigation fallbackPath="/learner" />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-muted">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="h-56 w-full object-cover md:h-72"
          />
        ) : (
          <div className="h-56 w-full bg-gradient-to-br from-primary/20 to-primary/10 md:h-72" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-end gap-3">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-none">
              {levelLabel[level] ?? level}
            </Badge>
            <Badge
              variant={statusVariant[status] ?? "outline"}
              className="border-none"
            >
              {statusLabel[status] ?? status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Coach */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar size="lg">
            <AvatarImage
              src={coachProfile.avatarUrl}
              alt={coachProfile.displayName}
            />
            <AvatarFallback>
              {coachProfile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              {t("learner.classDetail.coachLabel")}
            </span>
            <span className="text-lg font-semibold">
              {coachProfile.displayName}
            </span>
            {coachProfile.verificationStatus === "VERIFIED" && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Shield className="size-3.5" />
                {verificationLabel[coachProfile.verificationStatus]}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>{t("learner.classDetail.aboutTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">
            {description || t("learner.classDetail.noDescription")}
          </p>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t("learner.classDetail.scheduleTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("learner.classDetail.noSchedule")}
            </p>
          ) : (
            <div className="space-y-4">
              {schedules.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="size-4 text-muted-foreground" />
                      {dayjs(entry.scheduledAt).format("DD/MM/YYYY")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {dayjs(entry.scheduledAt).format("HH:mm")}
                      {" — "}
                      {entry.durationMinutes} phút
                    </div>
                    {entry.topic && <p className="text-sm">{entry.topic}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {locationDescription || t("learner.classDetail.noLocation")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price & Capacity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-5" />
              {t("learner.classDetail.tuitionTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN").format(priceVnd)}
              <span className="ml-1 text-base font-normal text-muted-foreground">
                {t("learner.classDetail.currencyLabel")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t("learner.classDetail.capacityTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("learner.classDetail.enrolledCount", {
                  enrolled: enrolledCount,
                  capacity,
                })}
              </span>
              <span className="font-medium">
                {spotsLeft > 0
                  ? t("learner.classDetail.spotsLeft", { count: spotsLeft })
                  : t("learner.classDetail.full")}
              </span>
            </div>
            <Progress value={(enrolledCount / capacity) * 100} />
          </CardContent>
        </Card>
      </div>

      {/* Enrollment */}
      <Card>
        <CardContent className="pt-6">
          {currentEnrollment ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              {enrollmentStatusLabel[currentEnrollment.status] ??
                t("learner.classDetail.registered")}
            </Button>
          ) : canEnroll && showEnrollmentAction ? (
            <Button
              size="lg"
              className="w-full"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending
                ? t("learner.classDetail.registering")
                : t("learner.classDetail.registerNow")}
            </Button>
          ) : canEnroll ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              {t("learner.classDetail.checkingEnrollment")}
            </Button>
          ) : isFull ? (
            <Button size="lg" className="w-full" disabled variant="secondary">
              {t("learner.classDetail.full")}
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {t("learner.classDetail.statusPrefix")}{" "}
              {statusLabel[status] ?? status}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bank Info Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("learner.classDetail.paymentInfoTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("learner.classDetail.paymentInfoDescription")}
            </DialogDescription>
          </DialogHeader>
          {bankInfo && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("learner.classDetail.bankNameLabel")}
                </span>
                <span className="font-medium">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("learner.classDetail.accountNameLabel")}
                </span>
                <span className="font-medium">{bankInfo.bankAccountName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("learner.classDetail.accountNumberLabel")}
                </span>
                <span className="font-medium tracking-widest">
                  {maskAccountNumber(bankInfo.bankAccountNumber)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("learner.classDetail.amountLabel")}
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat("vi-VN").format(priceVnd)}{" "}
                  {t("learner.classDetail.currencyLabel")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
