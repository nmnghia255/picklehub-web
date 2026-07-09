"use client"

import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSubscriptionTranslation } from "@/features/subscriptions/hooks/use-subscription-translation"

interface PaymentReturnContentProps {
  isSuccess: boolean
  responseCode?: string
}

export function PaymentReturnContent({
  isSuccess,
  responseCode,
}: PaymentReturnContentProps) {
  const { t } = useSubscriptionTranslation()
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

  const responseCodeMessage = useMemo(() => {
    if (!responseCode) return t("paymentReturn.defaultError")
    return (
      t("paymentReturn.responseCodes." + responseCode) ||
      t("paymentReturn.defaultError")
    )
  }, [responseCode, t])

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-lg overflow-hidden shadow-2xl">
          <div className="h-2 animate-pulse bg-linear-to-r from-emerald-400 via-green-500 to-teal-500" />

          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100 dark:bg-emerald-950/40 dark:ring-emerald-900/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {t("paymentReturn.successTitle")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("paymentReturn.successDescription")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 py-3 dark:border-emerald-800 dark:bg-emerald-950/20">
              <img
                src="https://vnpay.vn/s1/statics/img/logo-icon.svg"
                alt={t("paymentReturn.vnpayLogoAlt")}
                className="h-6 w-auto"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {t("paymentReturn.successBadge")}
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {t("paymentReturn.successBody", { countdown })}
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
            <Button
              asChild
              className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              <Link href="/subscriptions">
                {t("paymentReturn.successAction")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("paymentReturn.successHelp")}
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="h-2 bg-linear-to-r from-red-400 via-rose-500 to-orange-400" />

        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100 dark:bg-red-950/40 dark:ring-red-900/30">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>

          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            {t("paymentReturn.failureTitle")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("paymentReturn.failureDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-center text-sm font-medium text-red-700 dark:text-red-300">
              {responseCodeMessage}
            </p>
            {responseCode && (
              <p className="mt-1 text-center text-xs text-red-500 dark:text-red-400">
                {t("paymentReturn.errorCodeLabel", { responseCode })}
              </p>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t("paymentReturn.failureBody", { countdown })}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
          <Button
            asChild
            className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/subscriptions">
              {t("paymentReturn.retry")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">{t("paymentReturn.goHome")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
