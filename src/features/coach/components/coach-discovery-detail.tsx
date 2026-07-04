"use client"

import { ArrowLeft, Award, BadgeCheck, BarChart3, BookOpen, Calendar, Clock, Globe, Info, MapPin, Pencil, Plus, Star, Trash2,Users } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/features/auth/hooks/use-session"
import { useCoachOpenClasses, useCoachPublicProfile, useCoachReviews, useCreateReview, useDeleteReview,useUpdateReview } from "@/features/coach/hooks/use-coach-queries"
import type { Certification, CoachLevel, CoachProfile, LearnerScheduleItem,VerificationStatus } from "@/features/coach/types/coach"
import { useCreateBooking, useEnrollInClass, useLearnerSchedule } from "@/features/learner/hooks/use-learner-queries"
import { LearnerCoachRecommendationDialog } from "@/features/learner/components/learner-coach-recommendation-dialog"

const LEVEL_LABELS: Record<CoachLevel, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

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

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} tuần trước`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} tháng trước`
  const years = Math.floor(days / 365)
  return `${years} năm trước`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

function getCertBadgeVariant(status: VerificationStatus) {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
    case "UNVERIFIED":
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
  }
}

function OverviewTab({ coach }: { coach: CoachProfile }) {
  const { data: reviewsData, isLoading: reviewsLoading } = useCoachReviews(coach.id)
  const { data: classes, isLoading: classesLoading } = useCoachOpenClasses(coach.id)
  const reviews = reviewsData?.reviews ?? []

  return (
    <div className="space-y-6">
      {coach.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5" />
              Giới thiệu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-muted-foreground">{coach.bio}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="size-5" />
            Thông tin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {coach.yearsExperience} năm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chuyên môn</p>
              <div className="flex flex-wrap gap-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ngôn ngữ</p>
              <p className="flex items-center gap-1 font-medium">
                <Globe className="size-4" />
                {coach.languages.join(", ")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Giá</p>
              <p className="flex items-center gap-1 font-medium">
                <Clock className="size-4" />
                {formatCurrency(coach.hourlyRateVnd)} / giờ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {coach.certifications && coach.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BadgeCheck className="size-5" />
              Chứng chỉ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coach.certifications.map((cert: Certification) => (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{cert.name}</p>
                    {cert.issuingOrganization && (
                      <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                      {cert.expiresAt && ` - Hết hạn: ${new Date(cert.expiresAt).toLocaleDateString("vi-VN")}`}
                    </p>
                  </div>
                  <Badge className={getCertBadgeVariant(cert.verificationStatus)}>
                    {cert.verificationStatus === "VERIFIED" && "Đã xác thực"}
                    {cert.verificationStatus === "UNVERIFIED" && "Chưa xác thực"}
                    {cert.verificationStatus === "PENDING" && "Đang chờ"}
                    {cert.verificationStatus === "REJECTED" && "Từ chối"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="size-5" />
            Đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{coach.averageRating.toFixed(1)}</p>
              <StarRating rating={coach.averageRating} />
            </div>
            <Separator orientation="vertical" className="h-16" />
            <div>
              <p className="text-sm text-muted-foreground">{coach.reviewCount} đánh giá</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {reviewsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5" />
              Đánh giá từ học viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review, idx) => (
                <div key={review.reviewId ?? `review-${idx}`} className="flex gap-4">
                  <Avatar size="default">
                    <AvatarImage src={review.reviewerProfile.avatar ?? ""} alt={review.reviewerProfile.name} />
                    <AvatarFallback>{review.reviewerProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{review.reviewerProfile.name}</p>
                    <StarRating rating={review.rating} />
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="size-5" />
            Lớp học có sẵn
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : !classes || classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="mb-2 size-10 text-muted-foreground" />
              <p className="text-muted-foreground">Hiện chưa có lớp học nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls, idx) => (
                <div key={cls.id ?? `class-${idx}`} className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cls.title}</h3>
                        <Badge variant="outline">{LEVEL_LABELS[cls.level]}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{formatCurrency(cls.priceVnd)}</span>
                        <span className="text-muted-foreground">{cls.enrolledCount}/{cls.capacity} học viên</span>
                      </div>
                      {cls.schedules && cls.schedules.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-4" />
                          {cls.schedules.slice(0, 3).map((sched, sIdx) => (
                            <span key={sched.id ?? `sched-${sIdx}`} className="rounded-md border px-2 py-0.5 text-xs">
                              {new Date(sched.scheduledAt).toLocaleDateString("vi-VN", {
                                weekday: "short", day: "numeric", month: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleTab({ coachId }: { coachId: string }) {
  const session = useSession()
  const { data, isLoading, error } = useLearnerSchedule({
    coachProfileId: coachId,
    state: "all",
    sort: "asc",
    limit: 50,
  }, { enabled: !!session?.user })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có lịch học với huấn luyện viên này</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.data.map((item: LearnerScheduleItem, idx: number) => (
        <Card key={item.id ?? `schedule-${idx}`}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex-1 space-y-1">
              <p className="font-medium">{item.title}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{new Date(item.startsAt).toLocaleDateString("vi-VN", {
                  weekday: "long", day: "numeric", month: "numeric", year: "numeric",
                })}</span>
                <span>{new Date(item.startsAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                <span>{Math.round((new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / 60000)} phút</span>
              </div>
            </div>
            <Badge>
              {item.status === "upcoming" && "Sắp tới"}
              {item.status === "live" && "Đang diễn ra"}
              {item.status === "past" && "Đã kết thúc"}
              {item.status === "pending" && "Chờ xác nhận"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ReviewsTab({ coachId }: { coachId: string }) {
  const session = useSession()
  const isLearner = !!session?.user
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()

  const { data, isLoading, error } = useCoachReviews(coachId)
  const reviews = data?.reviews ?? []

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }
    try {
      await createReview.mutateAsync({
        coachId,
        dto: { rating: reviewRating, comment: reviewComment || undefined },
      })
      toast.success("Đã gửi đánh giá")
      setReviewOpen(false)
      setReviewComment("")
    } catch {
      toast.error("Gửi đánh giá thất bại")
    }
  }

  const handleStartEdit = (review: { reviewId: string; rating: number; comment: string | null }) => {
    setEditingReviewId(review.reviewId)
    setEditRating(review.rating)
    setEditComment(review.comment ?? "")
  }

  const handleSaveEdit = async () => {
    if (!editingReviewId) return
    if (editRating < 1 || editRating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }
    try {
      await updateReview.mutateAsync({
        coachId,
        reviewId: editingReviewId,
        dto: { rating: editRating, comment: editComment || undefined },
      })
      toast.success("Đã cập nhật đánh giá")
      setEditingReviewId(null)
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteReview.mutateAsync({ coachId, reviewId: deleteConfirmId })
      toast.success("Đã xóa đánh giá")
      setDeleteConfirmId(null)
    } catch {
      toast.error("Xóa đánh giá thất bại")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Không thể tải đánh giá. Vui lòng thử lại sau.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isLearner && (
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Star className="size-4" />
              Viết đánh giá
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Viết đánh giá</DialogTitle>
              <DialogDescription>Chia sẻ trải nghiệm của bạn với huấn luyện viên này.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Đánh giá (1-5 sao)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`size-8 ${star <= reviewRating ? "text-yellow-400" : "text-muted"}`}
                    >
                      <Star className="size-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhận xét</Label>
                <textarea
                  className="w-full rounded-md border p-2 text-sm"
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmitReview} disabled={createReview.isPending}>
                {createReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="mb-2 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6 pt-6">
            {reviews.map((review, idx) => {
              const isOwnReview = session?.user?.id && review.reviewerProfile.userId === session.user.id
              const isEditing = editingReviewId === review.reviewId

              if (isEditing) {
                return (
                  <div key={review.reviewId ?? `review-${idx}`} className="flex gap-4 rounded-lg border p-4">
                    <Avatar size="default">
                      <AvatarImage src={review.reviewerProfile.avatar ?? ""} alt={review.reviewerProfile.name} />
                      <AvatarFallback>{review.reviewerProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{review.reviewerProfile.name}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`size-6 ${star <= editRating ? "text-yellow-400" : "text-muted"}`}
                          >
                            <Star className="size-6 fill-current" />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full rounded-md border p-2 text-sm"
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={updateReview.isPending}>
                          {updateReview.isPending ? "Đang lưu..." : "Lưu"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={review.reviewId ?? `review-${idx}`} className="flex gap-4">
                  <Avatar size="default">
                    <AvatarImage src={review.reviewerProfile.avatar ?? ""} alt={review.reviewerProfile.name} />
                    <AvatarFallback>{review.reviewerProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.reviewerProfile.name}</p>
                      {isOwnReview && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(review)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Sửa đánh giá"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(review.reviewId)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Xóa đánh giá"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteReview} disabled={deleteReview.isPending}>
              {deleteReview.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClassesTab({ coachId }: { coachId: string }) {
  const session = useSession()
  const isLearner = !!session?.user
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const enrollMutation = useEnrollInClass()

  const { data: classes, isLoading, error } = useCoachOpenClasses(coachId)

  const handleEnroll = async (classId: string) => {
    setEnrollingId(classId)
    try {
      await enrollMutation.mutateAsync(classId)
      toast.success("Đăng ký lớp học thành công")
    } catch {
      toast.error("Đăng ký lớp thất bại")
    } finally {
      setEnrollingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Không thể tải lớp học. Vui lòng thử lại sau.</p>
        </CardContent>
      </Card>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Huấn luyện viên chưa có lớp học nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {classes.map((cls, idx) => (
        <Card key={cls.id ?? `class-${idx}`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{cls.title}</h3>
                  <Badge variant="outline">{LEVEL_LABELS[cls.level]}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{formatCurrency(cls.priceVnd)}</span>
                  <span className="text-muted-foreground">{cls.enrolledCount}/{cls.capacity} học viên</span>
                </div>
                {cls.schedules && cls.schedules.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    {cls.schedules.map((sched, sIdx) => (
                      <span key={sched.id ?? `sched-${sIdx}`} className="rounded-md border px-2 py-0.5 text-xs">
                        {new Date(sched.scheduledAt).toLocaleDateString("vi-VN", {
                          weekday: "short", day: "numeric", month: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {isLearner && cls.status === "OPEN" && (
                  <Button
                    size="sm"
                    onClick={() => handleEnroll(cls.id)}
                    disabled={enrollingId === cls.id}
                  >
                    {enrollingId === cls.id ? "Đang xử lý..." : "Đăng ký"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InfoTab({ coach }: { coach: CoachProfile }) {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
              <p className="font-medium">{coach.yearsExperience} năm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá theo giờ</p>
              <p className="font-medium">{formatCurrency(coach.hourlyRateVnd)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thành phố</p>
              <p className="font-medium">{coach.locationCity}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Chuyên môn</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngôn ngữ</p>
              <p className="font-medium">{coach.languages.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái xác thực</p>
              <Badge variant={coach.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                {coach.verificationStatus === "VERIFIED" && "Đã xác thực"}
                {coach.verificationStatus === "PENDING" && "Chờ xác thực"}
                {coach.verificationStatus === "UNVERIFIED" && "Chưa xác thực"}
                {coach.verificationStatus === "REJECTED" && "Từ chối"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-2">Thông tin thanh toán</p>
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Ngân hàng: </span>
              <span className="font-medium">{coach.paymentBankName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Số tài khoản: </span>
              <span className="font-medium">{coach.paymentAccountNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Chủ tài khoản: </span>
              <span className="font-medium">{coach.paymentAccountName}</span>
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-2">Các chứng chỉ</p>
          {coach.certifications.length === 0 ? (
            <p className="text-sm">Chưa có chứng chỉ nào</p>
          ) : (
            <div className="space-y-2">
              {coach.certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuingOrganization}</p>
                  </div>
                  <Badge className={getCertBadgeVariant(cert.verificationStatus)}>
                    {cert.verificationStatus === "VERIFIED" ? "Đã xác thực" : cert.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatsTab({ coach }: { coach: CoachProfile }) {
  const { data: reviewsData } = useCoachReviews(coach.id)
  const { data: classes } = useCoachOpenClasses(coach.id)
  const totalReviews = reviewsData?.reviewCount ?? coach.reviewCount
  const avgRating = reviewsData?.averageRating ?? coach.averageRating
  const totalClasses = classes?.length ?? 0
  const totalEnrolled = classes?.reduce((sum, cls) => sum + cls.enrolledCount, 0) ?? 0
  const totalCapacity = classes?.reduce((sum, cls) => sum + cls.capacity, 0) ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Star className="size-4 text-yellow-500" />
            Đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">{totalReviews} lượt đánh giá</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="size-4 text-blue-500" />
            Lớp học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalClasses}</p>
          <p className="text-sm text-muted-foreground">lớp đang mở</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-green-500" />
            Học viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalEnrolled}/{totalCapacity}</p>
          <p className="text-sm text-muted-foreground">đã đăng ký</p>
        </CardContent>
      </Card>
    </div>
  )
}

export type DiscoveryTabValue = "overview" | "schedule" | "reviews" | "classes" | "info" | "stats"

const TABS: { value: DiscoveryTabValue; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Tổng quan", icon: <Info className="size-4" /> },
  { value: "schedule", label: "Lịch", icon: <Calendar className="size-4" /> },
  { value: "reviews", label: "Đánh giá", icon: <Star className="size-4" /> },
  { value: "classes", label: "Khóa học", icon: <BookOpen className="size-4" /> },
  { value: "stats", label: "Thống kê", icon: <BarChart3 className="size-4" /> },
  { value: "info", label: "Thông tin", icon: <Award className="size-4" /> },
]

function CoachDiscoveryDetailInner({
  coachId,
  onBack,
  defaultTab,
}: {
  coachId: string
  onBack: () => void
  defaultTab: DiscoveryTabValue
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const isLearner = !!session?.user

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingDuration, setBookingDuration] = useState(60)
  const [bookingNote, setBookingNote] = useState("")

  const createBooking = useCreateBooking()

  const { data: coach, isLoading, error } = useCoachPublicProfile(coachId)

  const handleTabChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`/coaches?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleCreateBooking = async () => {
    if (!bookingDate || !bookingTime) {
      toast.error("Vui lòng chọn ngày và giờ")
      return
    }
    const sessionAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString()
    try {
      await createBooking.mutateAsync({
        coachId,
        dto: {
          sessionAt,
          durationMinutes: bookingDuration,
          learnerNote: bookingNote || undefined,
        },
      })
      toast.success("Yêu cầu đặt lịch đã được gửi")
      setBookingOpen(false)
      setBookingDate("")
      setBookingTime("")
      setBookingNote("")
    } catch {
      toast.error("Đặt lịch thất bại")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-xl font-medium text-muted-foreground">
              Không thể tải thông tin huấn luyện viên
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng thử lại hoặc quay lại danh sách.
            </p>
            <Button variant="outline" className="mt-4" onClick={onBack}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-1 -ml-2">
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Card>
        <CardContent className="flex items-start gap-6 pt-6">
          <Avatar size="lg" className="size-24">
            <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
            <AvatarFallback>{coach.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{coach.displayName}</h1>
              <Badge variant="secondary">{LEVEL_LABELS[coach.level]}</Badge>
              {coach.verificationStatus === "VERIFIED" && (
                <BadgeCheck className="size-5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{coach.locationCity}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <StarRating rating={coach.averageRating} />
                <span className="ml-1 font-medium">
                  {coach.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({coach.reviewCount} đánh giá)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-primary">
                {formatCurrency(coach.hourlyRateVnd)}/giờ
              </span>
            </div>
            {isLearner && (
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setBookingOpen(true)}>
                  <Plus className="size-4" />
                  Đặt lịch riêng
                </Button>
                <LearnerCoachRecommendationDialog
                  coachId={coachId}
                  coachName={coach.displayName}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lịch với {coach.displayName}</DialogTitle>
            <DialogDescription>
              Chọn thời gian bạn muốn học. HLV sẽ xác nhận sau.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Giờ</Label>
                <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thời lượng (phút)</Label>
              <Input type="number" value={bookingDuration} onChange={(e) => setBookingDuration(Number(e.target.value))} min={30} step={15} />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú (không bắt buộc)</Label>
              <Input placeholder="Ví dụ: Tôi muốn học kỹ thuật serve" value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Hủy</Button>
            <Button onClick={handleCreateBooking} disabled={createBooking.isPending}>
              {createBooking.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full gap-6">
        <TabsList variant="line" className="w-full min-w-0 flex-wrap justify-start gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="sm:flex-none">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 w-full min-w-0">
          <OverviewTab coach={coach} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-6 w-full min-w-0">
          <ScheduleTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-6 w-full min-w-0">
          <ReviewsTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="classes" className="mt-6 w-full min-w-0">
          <ClassesTab coachId={coachId} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6 w-full min-w-0">
          <StatsTab coach={coach} />
        </TabsContent>
        <TabsContent value="info" className="mt-6 w-full min-w-0">
          <InfoTab coach={coach} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function CoachDiscoveryDetail({
  coachId,
  onBack,
  defaultTab = "overview",
}: {
  coachId: string
  onBack: () => void
  defaultTab?: DiscoveryTabValue
}) {
  return (
    <Suspense fallback={null}>
      <CoachDiscoveryDetailInner coachId={coachId} onBack={onBack} defaultTab={defaultTab} />
    </Suspense>
  )
}
