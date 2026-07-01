"use client"

import { useParams } from "next/navigation"
import {
  useCoachPublicProfile,
  useCoachOpenClasses,
  useCoachReviews,
} from "@/features/coach/hooks/use-coach-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  Shield,
  BadgeCheck,
  Clock,
  Globe,
  Award,
  BookOpen,
} from "lucide-react"
import { PageContainer } from "@/components/page-container"
import Link from "next/link"
import type {
  CoachLevel,
  VerificationStatus,
  ClassStatus,
  Certification,
} from "@/features/coach/types/coach"

const LEVEL_LABELS: Record<CoachLevel, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  Pro: "Chuyên nghiệp",
}

const STATUS_LABELS: Record<ClassStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Mở",
  FULL: "Đầy",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
}

function StarRating({ rating }: { rating: number }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
      )
    } else if (rating >= i - 0.5) {
      stars.push(
        <span key={i} className="relative size-4">
          <Star className="absolute size-4 text-muted-foreground" />
          <Star className="absolute size-4 fill-yellow-400 text-yellow-400 [clip-path:inset(0_50%_0_0)]" />
        </span>
      )
    } else {
      stars.push(
        <Star key={i} className="size-4 text-muted-foreground" />
      )
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>
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

function getStatusBadgeVariant(status: ClassStatus) {
  switch (status) {
    case "OPEN":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
    case "FULL":
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
    case "ONGOING":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
    case "COMPLETED":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
  }
}

function formatRelativeTime(dateStr: string) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
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
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

function formatHourlyRate(amount: number) {
  return `${formatCurrency(amount)} / giờ`
}

export default function CoachDetailPage() {
  const { coachId } = useParams<{ coachId: string }>()

  const {
    data: coach,
    isLoading: coachLoading,
    error: coachError,
  } = useCoachPublicProfile(coachId)
  const {
    data: classes,
    isLoading: classesLoading,
  } = useCoachOpenClasses(coachId)
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useCoachReviews(coachId)

  if (coachLoading) {
    return (
      <div className="min-h-screen bg-background py-6 text-foreground">
        <PageContainer className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </PageContainer>
      </div>
    )
  }

  if (coachError || !coach) {
    return (
      <div className="min-h-screen bg-background py-6 text-foreground">
        <PageContainer>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Shield className="mb-4 size-16 text-muted-foreground" />
              <p className="text-xl font-medium text-muted-foreground">
                Huấn luyện viên không tồn tại
              </p>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    )
  }

  const levelLabel = LEVEL_LABELS[coach.level]
  const reviews = reviewsData?.reviews ?? []

  return (
    <div className="min-h-screen bg-background py-6 text-foreground">
      <PageContainer className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="flex items-start gap-6 pt-6">
            <Avatar size="lg" className="size-24">
              <AvatarImage src={coach.avatarUrl} alt={coach.displayName} />
              <AvatarFallback>
                {coach.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{coach.displayName}</h1>
                <Badge variant="secondary">{levelLabel}</Badge>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {coach.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="size-5" />
                Giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {coach.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
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
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
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
                  {formatHourlyRate(coach.hourlyRateVnd)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
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
                  <div
                    key={cert.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{cert.name}</p>
                      {cert.issuingOrganization && (
                        <p className="text-sm text-muted-foreground">
                          {cert.issuingOrganization}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Cấp ngày:{" "}
                        {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                        {cert.expiresAt &&
                          ` - Hết hạn: ${new Date(cert.expiresAt).toLocaleDateString("vi-VN")}`}
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

        {/* Rating */}
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
                <p className="text-4xl font-bold">
                  {coach.averageRating.toFixed(1)}
                </p>
                <StarRating rating={coach.averageRating} />
              </div>
              <Separator orientation="vertical" className="h-16" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {coach.reviewCount} đánh giá
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5" />
              Đánh giá từ học viên
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Star className="mb-2 size-10 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="flex gap-4">
                    <Avatar size="default">
                      <AvatarImage
                        src={review.reviewerProfile.avatar ?? ""}
                        alt={review.reviewerProfile.name}
                      />
                      <AvatarFallback>
                        {review.reviewerProfile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {review.reviewerProfile.name}
                      </p>
                      <StarRating rating={review.rating} />
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(review.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Classes */}
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
                <p className="text-muted-foreground">
                  Hiện chưa có lớp học nào
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cls.title}</h3>
                          <Badge
                            className={getStatusBadgeVariant(cls.status)}
                          >
                            {STATUS_LABELS[cls.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cls.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Cấp độ: {LEVEL_LABELS[cls.level]}
                          </span>
                          <span className="text-muted-foreground">
                            {formatHourlyRate(cls.priceVnd)}
                          </span>
                          <span className="text-muted-foreground">
                            {cls.enrolledCount}/{cls.capacity} học viên
                          </span>
                        </div>
                        {cls.schedules && cls.schedules.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4" />
                            {cls.schedules.slice(0, 3).map((sched) => (
                              <span
                                key={sched.id}
                                className="rounded-md border px-2 py-0.5 text-xs"
                              >
                                {new Date(
                                  sched.scheduledAt
                                ).toLocaleDateString("vi-VN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            ))}
                            {cls.schedules.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{cls.schedules.length - 3} buổi
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/classes/${cls.id}`}>Ghi danh</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Booking */}
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href={`/coaches/${coachId}/booking`}>
              Yêu cầu đặt lịch riêng
            </Link>
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}
