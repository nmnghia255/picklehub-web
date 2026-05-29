"use client"

import {
  CheckCircle2,
  CreditCard,
  Landmark,
  QrCode,
  Upload,
} from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { BookingBrowserService } from "@/features/sport-center/api/booking-browser-service"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import { formatCurrencyVnd } from "@/utils/expense-utils"

type PaymentMethod = "qr" | "credit"

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

function formatBookingStatus(status: BookingResponse["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "Đã xác nhận"
    case "CANCELLED":
      return "Đã hủy"
    case "COMPLETED":
      return "Hoàn thành"
    default:
      return "Chờ thanh toán"
  }
}

function getStatusVariant(status: BookingResponse["status"]) {
  switch (status) {
    case "CONFIRMED":
      return "default"
    case "CANCELLED":
      return "destructive"
    case "COMPLETED":
      return "secondary"
    default:
      return "outline"
  }
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Không thể đọc ảnh đã chọn."))
    reader.readAsDataURL(file)
  })
}

export default function BookingConfirmationPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const searchParams = useSearchParams()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id
  const bookingId = searchParams.get("bookingId") ?? ""
  const hasBookingId = bookingId.length > 0

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(() => hasBookingId)
  const [loadError, setLoadError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr")
  const [paymentProofData, setPaymentProofData] = useState("")
  const [paymentProofPreview, setPaymentProofPreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (!hasBookingId) {
      return
    }

    let active = true

    async function loadBooking() {
      setIsLoading(true)
      setLoadError("")
      setSubmitMessage("")
      setSubmitError("")

      try {
        const result = await BookingBrowserService.getBookingById(bookingId)
        if (!active) return
        setBooking(result)
      } catch (error) {
        if (!active) return
        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin đặt sân."
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadBooking()

    return () => {
      active = false
    }
  }, [bookingId, hasBookingId])

  const centerName = booking?.center.name ?? "Sân pickleball"
  const canUploadProof = paymentMethod === "qr" && !booking?.paymentProofUrl
  const hasProof = Boolean(booking?.paymentProofUrl || paymentProofPreview)

  const paymentInfo = useMemo(() => {
    if (!booking) return null

    return [
      { label: "Tổng tiền", value: formatCurrencyVnd(booking.totalPrice) },
      {
        label: "Đã trừ credit",
        value: formatCurrencyVnd(booking.creditApplied),
      },
      {
        label: "Cần thanh toán",
        value: formatCurrencyVnd(booking.paymentRemaining),
      },
    ]
  }, [booking])

  const handlePaymentProofChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setSubmitError("Vui lòng chọn một ảnh hóa đơn hợp lệ.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Ảnh phải nhỏ hơn 5MB.")
      return
    }

    setSubmitError("")
    const dataUrl = await fileToDataUrl(file)
    setPaymentProofData(dataUrl)
    setPaymentProofPreview(dataUrl)
  }

  const handleSubmitPayment = async () => {
    if (!booking) return

    if (paymentMethod === "credit") {
      setSubmitMessage("Bạn đã chọn thanh toán bằng credit. Không cần tải ảnh.")
      return
    }

    if (!paymentProofData) {
      setSubmitError("Vui lòng tải lên ảnh hóa đơn thanh toán.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitMessage("")

    try {
      const updatedBooking = await BookingBrowserService.submitPaymentProof(
        booking.id,
        paymentProofData
      )
      setBooking(updatedBooking)
      setSubmitMessage("Đã gửi ảnh thanh toán thành công.")
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể gửi ảnh thanh toán."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasBookingId) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-6">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertTitle>Không thể mở xác nhận đặt sân</AlertTitle>
          <AlertDescription>
            Không tìm thấy mã đặt sân. Vui lòng quay lại và thử lại.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Skeleton className="h-130 rounded-3xl" />
          <Skeleton className="h-130 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (loadError || !booking) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-6">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertTitle>Không thể mở xác nhận đặt sân</AlertTitle>
          <AlertDescription>
            {loadError || "Không tìm thấy đơn đặt sân."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(booking.status)}>
                {formatBookingStatus(booking.status)}
              </Badge>
              <Badge variant="outline">Mã đặt sân: {booking.id}</Badge>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Xác nhận đặt sân
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Kiểm tra lại toàn bộ thông tin đặt sân và chọn phương thức thanh
                toán phù hợp trước khi hoàn tất.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/sport-center/${centerId}/booking`)}
            >
              Quay lại đặt sân
            </Button>

            <div className="grid gap-3 sm:grid-cols-3">
              {paymentInfo?.map((item) => (
                <Card key={item.label} className="border-dashed">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg shadow-black/5">
              <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-emerald-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="size-5" />
                  Thông tin đặt sân
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4 rounded-2xl bg-muted/50 p-4">
                  <div>
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      Sân
                    </p>
                    <p className="mt-1 text-lg font-semibold">{centerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.center.address}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Khách hàng</p>
                      <p className="font-medium">{booking.playerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{booking.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ngày đặt</p>
                      <p className="font-medium">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cập nhật</p>
                      <p className="font-medium">
                        {formatDateTime(booking.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      Ghi chú
                    </p>
                    <Textarea
                      value={booking.note || "Không có ghi chú."}
                      readOnly
                      className="mt-2 min-h-24 resize-none bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        Lịch đặt
                      </p>
                      <p className="text-lg font-semibold">
                        {booking.bookingCount} lượt đặt
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {booking.items.length} sân
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {booking.items.map((item) => (
                      <div
                        key={`${item.courtId}-${item.startTime}-${item.endTime}`}
                        className="rounded-xl border bg-muted/30 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{item.courtName}</p>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {formatCurrencyVnd(item.courtPrice)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-black/5">
              <CardHeader>
                <CardTitle>Chi tiết dịch vụ và sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Dịch vụ</h3>
                    <span className="text-sm text-muted-foreground">
                      {booking.totalServicePrice
                        ? formatCurrencyVnd(booking.totalServicePrice)
                        : "0 VND"}
                    </span>
                  </div>
                  {booking.services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Không có dịch vụ bổ sung.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {booking.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between rounded-xl border p-3"
                        >
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {service.quantity} x{" "}
                              {formatCurrencyVnd(service.price)}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatCurrencyVnd(service.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Sản phẩm</h3>
                    <span className="text-sm text-muted-foreground">
                      {booking.totalProductPrice
                        ? formatCurrencyVnd(booking.totalProductPrice)
                        : "0 VND"}
                    </span>
                  </div>
                  {booking.products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Không có sản phẩm kèm theo.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {booking.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between rounded-xl border p-3"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.quantity} x{" "}
                              {formatCurrencyVnd(product.price)}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatCurrencyVnd(product.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 border-0 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Landmark className="size-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                  className="grid gap-3"
                >
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors hover:border-primary/60 hover:bg-accent/40">
                    <RadioGroupItem value="qr" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="size-4 text-primary" />
                        <span className="font-medium">
                          Thanh toán qua QR code
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tải ảnh hóa đơn thanh toán sau khi chuyển khoản.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors hover:border-primary/60 hover:bg-accent/40">
                    <RadioGroupItem value="credit" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="size-4 text-primary" />
                        <span className="font-medium">Dùng credit</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Không cần tải ảnh. Hệ thống sẽ ghi nhận thanh toán bằng
                        credit.
                      </p>
                    </div>
                  </label>
                </RadioGroup>

                {paymentMethod === "qr" ? (
                  <div className="space-y-4 rounded-2xl border border-dashed p-4">
                    <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-2xl border bg-muted/40 p-2">
                        {booking.center.paymentQrUrl ? (
                          <img
                            src={booking.center.paymentQrUrl}
                            alt="Mã QR thanh toán"
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            Chưa có QR thanh toán.
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs tracking-wide text-muted-foreground uppercase">
                            Thông tin chuyển khoản
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {booking.center.paymentAccountName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.center.paymentBankName}
                          </p>
                          <p className="text-sm font-medium">
                            {booking.center.paymentAccountNumber}
                          </p>
                        </div>

                        <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                          Vui lòng tải ảnh hóa đơn sau khi chuyển khoản để hoàn
                          tất xác nhận.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-proof">Ảnh hóa đơn</Label>
                      <Input
                        id="payment-proof"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          void handlePaymentProofChange(event)
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Chỉ chấp nhận ảnh và dung lượng dưới 5MB.
                      </p>
                    </div>

                    {hasProof && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">
                          Xem trước ảnh đã chọn
                        </p>
                        <div className="overflow-hidden rounded-2xl border">
                          <img
                            src={
                              paymentProofPreview ||
                              booking.paymentProofUrl ||
                              ""
                            }
                            alt="Xem trước hóa đơn"
                            className="h-56 w-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => void handleSubmitPayment()}
                      disabled={isSubmitting || !canUploadProof}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2 size-4" />
                          Đang gửi ảnh...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 size-4" />
                          Gửi ảnh thanh toán
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
                    Bạn đã chọn dùng credit. Không cần tải ảnh hay thực hiện
                    thêm thao tác nào.
                  </div>
                )}

                {submitMessage && (
                  <Alert>
                    <CheckCircle2 className="size-4" />
                    <AlertTitle>Hoàn tất</AlertTitle>
                    <AlertDescription>{submitMessage}</AlertDescription>
                  </Alert>
                )}

                {submitError && (
                  <Alert variant="destructive">
                    <AlertTitle>Có lỗi xảy ra</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {booking.paymentProofUrl && paymentMethod === "qr" && (
                  <div className="rounded-2xl border bg-muted/30 p-4 text-sm">
                    <p className="font-medium">Hóa đơn đã được tải lên</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatDateTime(booking.paymentProofUploadedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
