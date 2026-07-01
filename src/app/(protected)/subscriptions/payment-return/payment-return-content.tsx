"use client"

import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PaymentReturnContentProps {
  isSuccess: boolean
  responseCode?: string
}

const VNPAY_RESPONSE_CODES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
  "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
  "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
  "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch.",
  "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định.",
}

export function PaymentReturnContent({
  isSuccess,
  responseCode,
}: PaymentReturnContentProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(isSuccess ? 5 : 10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/subscriptions")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const errorMessage =
    responseCode && VNPAY_RESPONSE_CODES[responseCode]
      ? VNPAY_RESPONSE_CODES[responseCode]
      : "Giao dịch không thành công. Vui lòng thử lại."

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-lg overflow-hidden shadow-2xl">
          {/* Animated top bar */}
          <div className="h-2 animate-pulse bg-linear-to-r from-emerald-400 via-green-500 to-teal-500" />

          <CardHeader className="pb-4 text-center">
            {/* Success icon */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-900/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Thanh toán thành công! 🎉
            </CardTitle>
            <CardDescription className="text-base">
              Gói đăng ký của bạn đã được kích hoạt thành công.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            {/* VNPay badge */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 py-3 dark:border-emerald-800 dark:bg-emerald-950/20">
              <img
                src="https://vnpay.vn/s1/statics/img/logo-icon.svg"
                alt="VNPay"
                className="h-6 w-auto"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Thanh toán qua VNPay đã được xác nhận
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Bạn có thể bắt đầu sử dụng ngay các tính năng của gói đăng ký. Tự
              động chuyển về trang đăng ký sau{" "}
              <span className="font-bold text-emerald-600">{countdown}</span>{" "}
              giây.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
            <Button
              asChild
              className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              <Link href="/subscriptions">
                Xem gói đăng ký của tôi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ hỗ trợ.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Failure state
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Error top bar */}
        <div className="h-2 bg-linear-to-r from-red-400 via-rose-500 to-orange-400" />

        <CardHeader className="pb-4 text-center">
          {/* Error icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100 dark:bg-red-950/40 dark:ring-red-900/30">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>

          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Thanh toán thất bại
          </CardTitle>
          <CardDescription className="text-base">
            Giao dịch của bạn chưa được hoàn thành.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Error message */}
          <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-center text-sm font-medium text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
            {responseCode && (
              <p className="mt-1 text-center text-xs text-red-500 dark:text-red-400">
                Mã lỗi: {responseCode}
              </p>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Gói đăng ký của bạn chưa được kích hoạt. Bạn có thể thử lại bất cứ
            lúc nào. Tự động chuyển về trang đăng ký sau{" "}
            <span className="font-bold text-red-500">{countdown}</span> giây.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
          <Button
            asChild
            className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/subscriptions">
              Thử lại
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
