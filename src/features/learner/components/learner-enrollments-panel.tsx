"use client"

import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Upload,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { ErrorState } from "@/components/shared/error-state"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { PaymentProofUploader } from "@/features/learner/components/payment-proof-uploader"
import {
  useCancelEnrollment,
  useMyEnrollments,
  useUploadEnrollmentPaymentProof,
} from "@/features/learner/hooks/use-learner-queries"
import { getErrorMessage } from "@/lib/api-client"
import { formatCurrency } from "@/utils/expense-utils"

function getLocaleCode(language: string) {
  return language.startsWith("vi") ? "vi-VN" : "en-US"
}

function EnrollmentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-32" />
      </CardFooter>
    </Card>
  )
}

function UploadDialog({
  enrollmentId,
  triggerLabel,
}: {
  enrollmentId: string
  triggerLabel: string
}) {
  const { t } = useTranslation("common")
  const [open, setOpen] = useState(false)
  const [paymentProofUrl, setPaymentProofUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const uploadMutation = useUploadEnrollmentPaymentProof()

  const handleSubmit = async () => {
    if (!paymentProofUrl) {
      toast.error(t("learner.enrollments.uploadProofRequired"))
      return
    }
    try {
      await uploadMutation.mutateAsync({
        enrollmentId,
        paymentProofUrl,
      })
      toast.success(t("learner.enrollments.uploadProofSuccess"))
      setOpen(false)
      setPaymentProofUrl("")
    } catch {
      toast.error(t("learner.enrollments.uploadProofError"))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setPaymentProofUrl("")
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-1 size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("learner.enrollments.uploadProofDialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("learner.enrollments.uploadProofDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("learner.enrollments.uploadProofLabel")}
          </p>
          <PaymentProofUploader
            value={paymentProofUrl}
            onChange={setPaymentProofUrl}
            onUploadingChange={setIsUploading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("learner.enrollments.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              uploadMutation.isPending || isUploading || !paymentProofUrl
            }
          >
            {uploadMutation.isPending
              ? t("learner.enrollments.uploading")
              : t("learner.enrollments.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelDialog({ enrollmentId }: { enrollmentId: string }) {
  const { t } = useTranslation("common")
  const cancelMutation = useCancelEnrollment()

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(enrollmentId)
      toast.success(t("learner.enrollments.cancelSuccess"))
    } catch {
      toast.error(t("learner.enrollments.cancelError"))
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <XCircle className="mr-1 size-4" />
          {t("learner.enrollments.cancelEnrollment")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("learner.enrollments.cancelDialogTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("learner.enrollments.cancelDialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("learner.enrollments.cancelBack")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending
              ? t("learner.enrollments.cancelling")
              : t("learner.enrollments.cancelConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function LearnerEnrollmentsPanel() {
  const { t, i18n } = useTranslation("common")
  const session = useSession()
  const locale = getLocaleCode(i18n.language)
  const {
    data: enrollments,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyEnrollments({ enabled: !!session?.user })

  const paymentStatusConfig: Record<
    string,
    { label: string; className: string; icon: ReactNode }
  > = {
    PENDING_PROOF: {
      label: t("learner.enrollments.paymentPendingProof"),
      className: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="size-3" />,
    },
    PENDING_REVIEW: {
      label: t("learner.enrollments.paymentPendingReview"),
      className: "bg-blue-100 text-blue-800",
      icon: <AlertTriangle className="size-3" />,
    },
    SETTLED: {
      label: t("learner.enrollments.paymentSettled"),
      className: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="size-3" />,
    },
    REJECTED: {
      label: t("learner.enrollments.paymentRejected"),
      className: "bg-red-100 text-red-800",
      icon: <XCircle className="size-3" />,
    },
  }

  const enrollmentStatusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    ACTIVE: {
      label: t("learner.enrollments.statusActive"),
      className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
      label: t("learner.enrollments.statusCancelled"),
      className: "bg-gray-100 text-gray-800",
    },
    COMPLETED: {
      label: t("learner.enrollments.statusCompleted"),
      className: "bg-blue-100 text-blue-800",
    },
  }

  const levelLabel: Record<string, string> = {
    Beginner: t("learner.enrollments.levelBeginner"),
    Intermediate: t("learner.enrollments.levelIntermediate"),
    Advanced: t("learner.enrollments.levelAdvanced"),
    Pro: t("learner.enrollments.levelPro"),
  }

  if (isError) {
    return (
      <ErrorState
        title={t("learner.enrollments.errorTitle")}
        description={getErrorMessage(error)}
        retry={refetch}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <EnrollmentSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="mb-4 size-12 text-muted-foreground" />
          <p className="mb-2 text-center text-lg font-medium">
            {t("learner.enrollments.noEnrollments")}
          </p>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {t("learner.enrollments.noEnrollmentsDescription")}
          </p>
          <Button asChild>
            <Link href="/classes">
              {t("learner.enrollments.exploreClasses")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment, idx) => {
        const paymentCfg = paymentStatusConfig[enrollment.paymentStatus]
        const enrollmentCfg = enrollmentStatusConfig[enrollment.status]

        return (
          <Card key={enrollment.id ?? `enrollment-${idx}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {enrollment.className ||
                      t("learner.enrollments.classFallback")}
                  </CardTitle>
                  <CardDescription>
                    {enrollment.classLevel
                      ? (levelLabel[enrollment.classLevel] ??
                        enrollment.classLevel)
                      : ""}
                    {enrollment.locationDescription
                      ? ` • ${enrollment.locationDescription}`
                      : ""}
                    {enrollment.scheduleDate
                      ? ` • ${new Date(enrollment.scheduleDate).toLocaleDateString(locale)}`
                      : ""}
                  </CardDescription>
                </div>
                {enrollmentCfg && (
                  <Badge className={enrollmentCfg.className}>
                    {enrollmentCfg.label}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {enrollment.coachName && (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={enrollment.coachAvatar} />
                      <AvatarFallback>
                        {(enrollment.coachName ?? "CT")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {enrollment.coachName ??
                        t("learner.enrollments.coachFallback")}
                    </span>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {paymentCfg && (
                    <Badge className={paymentCfg.className}>
                      {paymentCfg.icon}
                      {paymentCfg.label}
                    </Badge>
                  )}
                  <span className="text-sm font-semibold">
                    {formatCurrency(enrollment.amountVnd, "VND", locale)}
                  </span>
                </div>
              </div>

              {enrollment.paymentBankName && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Banknote className="size-4" />
                    {t("learner.enrollments.transferInfo")}
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <p>
                      {t("learner.enrollments.bankName")}
                      <span className="font-medium">
                        {enrollment.paymentBankName}
                      </span>
                    </p>
                    <p>
                      {t("learner.enrollments.accountNumber")}
                      <span className="font-medium">
                        {enrollment.paymentAccountNumber}
                      </span>
                    </p>
                    <p>
                      {t("learner.enrollments.accountName")}
                      <span className="font-medium">
                        {enrollment.paymentAccountName}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              {enrollment.paymentStatus === "PENDING_PROOF" && (
                <UploadDialog
                  enrollmentId={enrollment.id}
                  triggerLabel={t("learner.enrollments.uploadProof")}
                />
              )}
              {enrollment.paymentStatus === "PENDING_REVIEW" && (
                <Button variant="outline" size="sm" disabled>
                  <Clock className="mr-1 size-4" />
                  {t("learner.enrollments.paymentPendingReview")}
                </Button>
              )}
              {enrollment.paymentStatus === "REJECTED" && (
                <UploadDialog
                  enrollmentId={enrollment.id}
                  triggerLabel={t("learner.enrollments.uploadProofAgain")}
                />
              )}
              {enrollment.paymentStatus === "SETTLED" && (
                <Button variant="outline" size="sm" disabled>
                  <CheckCircle2 className="mr-1 size-4" />
                  {t("learner.enrollments.paymentSettled")}
                </Button>
              )}

              {enrollment.status === "ACTIVE" && (
                <CancelDialog enrollmentId={enrollment.id} />
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
