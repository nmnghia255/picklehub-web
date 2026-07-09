"use client"

import {
  AlertCircle,
  Building2,
  Check,
  CreditCard,
  Loader2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  cancelSubscriptionAction,
  subscribeToPlanAction,
} from "../actions/subscription-actions"
import { useSubscriptionTranslation } from "../hooks/use-subscription-translation"
import type {
  AvailableSubscriptionPlan,
  BillingCycles,
  PlanType,
  Subscription,
} from "../types/subscriptions"

interface SubscriptionCardsProps {
  availablePlans: AvailableSubscriptionPlan[]
  mySubscriptions: Subscription[]
}

export function SubscriptionCards({
  availablePlans,
  mySubscriptions,
}: SubscriptionCardsProps) {
  const router = useRouter()
  const { t } = useSubscriptionTranslation()
  const [isPending, startTransition] = useTransition()

  // Tab selection for billing cycle
  const cycles = React.useMemo(() => {
    const list = new Set<BillingCycles>()
    availablePlans.forEach((plan) => {
      if (plan.isActive) {
        list.add(plan.billingCycle)
      }
    })
    return Array.from(list)
  }, [availablePlans])

  const [activeCycle, setActiveCycle] = React.useState<BillingCycles>(() => {
    if (cycles.includes("YEARLY")) return "YEARLY"
    if (cycles.includes("MONTHLY")) return "MONTHLY"
    if (cycles.includes("QUARTERLY")) return "QUARTERLY"
    return cycles[0] || "MONTHLY"
  })

  // Confirm states
  const [subscribingPlan, setSubscribingPlan] =
    React.useState<AvailableSubscriptionPlan | null>(null)
  const [cancelingSubscription, setCancelingSubscription] =
    React.useState<Subscription | null>(null)

  // Filter plans based on billing cycle
  const filteredPlans = React.useMemo(() => {
    return availablePlans
      .filter((plan) => plan.isActive && plan.billingCycle === activeCycle)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [availablePlans, activeCycle])

  // Get active subscription of a plan if exists
  const activeSubscribedPlans = React.useMemo(() => {
    return mySubscriptions.filter((sub) => sub.status === "ACTIVE")
  }, [mySubscriptions])

  // Formatting helper for currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const getPlanTypeIcon = (type: PlanType) => {
    switch (type) {
      case "SPORT_CENTER_MANAGER":
        return <Building2 className="size-6 text-primary" />
      case "GROUP_OWNER":
        return <Users className="size-6 text-indigo-500" />
      case "SOCIAL_HOST":
        return <Sparkles className="size-6 text-amber-500" />
      case "TOURNAMENT_ORGANIZER":
        return <Trophy className="size-6 text-emerald-500" />
      default:
        return <Sparkles className="size-6 text-primary" />
    }
  }

  const handleSubscribe = (plan: AvailableSubscriptionPlan) => {
    setSubscribingPlan(plan)
  }

  const confirmSubscribe = () => {
    if (!subscribingPlan) return

    const planName = subscribingPlan.name
    const planId = subscribingPlan.id

    startTransition(async () => {
      setSubscribingPlan(null)
      const res = await subscribeToPlanAction(planId)
      if (res.success && res.paymentUrl) {
        toast.success(
          t("redirectingToPayment", {
            planName,
          })
        )
        // Redirect to VNPay payment gateway
        window.location.href = res.paymentUrl
      } else if (res.success) {
        // Free plan — no payment URL
        toast.success(t("subscribeSuccess", { planName }))
        router.refresh()
      } else {
        toast.error(res.error || t("errorOccurred"))
      }
    })
  }

  const handleCancel = (sub: Subscription) => {
    setCancelingSubscription(sub)
  }

  const confirmCancel = () => {
    if (!cancelingSubscription) return

    const subId = cancelingSubscription.id

    startTransition(async () => {
      setCancelingSubscription(null)
      const res = await cancelSubscriptionAction(subId)
      if (res.success) {
        toast.success(t("cancelSuccess"))
        router.refresh()
      } else {
        toast.error(res.error || t("errorOccurred"))
      }
    })
  }

  return (
    <div className="space-y-12">
      {/* Header section with lime/green accents */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-primary/10 via-transparent to-transparent px-6 py-10 text-center sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-linear-to-b from-background/0 via-background/50 to-background" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-4">
          <h1 className="bg-linear-to-r from-foreground via-foreground/90 to-primary bg-clip-text p-2 text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Active Subscriptions Section */}
      {activeSubscribedPlans.length > 0 && (
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <CreditCard className="size-5 text-primary" />
            {t("mySubscriptions")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSubscribedPlans.map((sub) => {
              const expiresDate = new Date(sub.endDate).toLocaleDateString(
                "vi-VN"
              )
              return (
                <Card
                  key={sub.id}
                  className="relative animate-in overflow-hidden border-primary/20 bg-primary/5 shadow-md duration-300 fade-in slide-in-from-bottom-4"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 translate-y-[-8px] rotate-45 bg-primary/10" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPlanTypeIcon(sub.plan.type)}
                        <div>
                          <CardTitle className="text-base font-bold">
                            {sub.plan.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {sub.plan.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="border-primary/25 bg-primary/15 text-xs font-semibold text-primary hover:bg-primary/20">
                        {t("active")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4 text-xs sm:text-sm">
                    <div className="flex justify-between border-b border-primary/10 pb-2">
                      <span className="text-muted-foreground">
                        {t("startDate")}
                      </span>
                      <span className="font-medium">
                        {new Date(sub.startDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-2">
                      <span className="text-muted-foreground">
                        {t("endDate")}
                      </span>
                      <span className="font-semibold text-primary">
                        {expiresDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("autoRenew")}
                      </span>
                      <Badge
                        variant={sub.autoRenew ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {sub.autoRenew ? t("yes") : t("no")}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive/20 text-xs text-destructive transition-colors duration-200 hover:border-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(sub)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                      ) : null}
                      {t("cancel")}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Pricing cycles switcher */}
      {cycles.length > 1 && (
        <div className="flex justify-center">
          <Tabs
            value={activeCycle}
            onValueChange={(val) => setActiveCycle(val as BillingCycles)}
            className="w-full max-w-lg"
          >
            <TabsList className="grid h-14! w-full grid-cols-3 rounded-full border border-border bg-muted/50">
              {cycles.map((cycle) => (
                <TabsTrigger
                  key={cycle}
                  value={cycle}
                  className="rounded-full text-sm transition-all duration-200"
                >
                  {cycle === "MONTHLY"
                    ? t("monthly")
                    : cycle === "QUARTERLY"
                      ? t("quarterly")
                      : t("yearly")}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Available Plans Grid */}
      <div className="mx-auto grid max-w-6xl justify-center gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {filteredPlans.map((plan) => {
          // Check if user has an active subscription to this plan
          const hasActiveSub = activeSubscribedPlans.some(
            (sub) => sub.planId === plan.id
          )

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                hasActiveSub
                  ? "border-primary bg-primary/2 shadow-md dark:bg-primary/1"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {hasActiveSub && (
                <div className="absolute top-0 right-1/2 z-10 translate-x-1/2 translate-y-[-50%]">
                  <Badge className="border-primary bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase hover:bg-primary">
                    {t("currentPlan")}
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-2.5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl border border-border/50 bg-muted/60 p-2.5">
                    {getPlanTypeIcon(plan.type)}
                  </div>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-8 text-sm">
                    {plan.description}
                  </CardDescription>
                </div>

                <div className="pt-2">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {formatPrice(plan.priceVnd)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    / {plan.durationInDays} {t("dayUnit")}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pb-6">
                <div className="h-px bg-border/60" />
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                        <Check className="size-3 stroke-3 text-primary" />
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-2 pb-6">
                {hasActiveSub ? (
                  <Button
                    variant="outline"
                    className="w-full cursor-default rounded-xl border-primary/20 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/5"
                    disabled
                  >
                    <Check className="mr-2 size-4" />
                    {t("active")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    variant={plan.priceVnd > 0 ? "default" : "outline"}
                    className={`w-full rounded-xl text-xs font-semibold transition-all duration-300 ${
                      plan.priceVnd > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
                        : "hover:bg-accent"
                    }`}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    {t("subscribe")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Subscription Confirmation Modal */}
      <AlertDialog
        open={subscribingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setSubscribingPlan(null)
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <div className="mb-2 w-fit rounded-full bg-primary/10 p-3">
              {subscribingPlan?.priceVnd && subscribingPlan.priceVnd > 0 ? (
                <CreditCard className="size-6 text-primary" />
              ) : (
                <Sparkles className="size-6 text-primary" />
              )}
            </div>
            <AlertDialogTitle>
              {t("confirmSubscribeTitle", {
                planName: subscribingPlan?.name || "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed sm:text-sm">
              {subscribingPlan?.priceVnd && subscribingPlan.priceVnd > 0
                ? t("confirmSubscribeVNPayDesc", {
                    planName: subscribingPlan?.name || "",
                  })
                : t("confirmSubscribeDesc", {
                    planName: subscribingPlan?.name || "",
                  })}
            </AlertDialogDescription>
            {subscribingPlan?.priceVnd && subscribingPlan.priceVnd > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30">
                <img
                  src="https://vnpay.vn/s1/statics/img/logo-icon.svg"
                  alt={t("paymentReturn.vnpayLogoAlt")}
                  className="h-5 w-auto"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {t("vnpaySecureNote")}
                </span>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("back")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubscribe}
              disabled={isPending}
              className="bg-primary font-semibold text-primary-foreground hover:bg-primary/95"
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {subscribingPlan?.priceVnd && subscribingPlan.priceVnd > 0
                ? t("proceedToPayment")
                : t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancellation Confirmation Modal */}
      <AlertDialog
        open={cancelingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setCancelingSubscription(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <div className="mb-2 w-fit rounded-full bg-destructive/10 p-3">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <AlertDialogTitle>{t("confirmCancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed sm:text-sm">
              {t("confirmCancelDesc", {
                planName: cancelingSubscription?.plan.name || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("back")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isPending}
              variant="destructive"
              className="font-semibold"
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
