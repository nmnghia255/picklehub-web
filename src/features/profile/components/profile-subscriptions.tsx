"use client"

import {
  ArrowRight,
  Building2,
  Crown,
  Plus,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type {
  PlanType,
  Subscription,
} from "@/features/subscriptions/types/subscriptions"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface ProfileSubscriptionsProps {
  subscriptions?: Subscription[]
  isOwnProfile?: boolean
}

export function ProfileSubscriptions({
  subscriptions,
  isOwnProfile = false,
}: ProfileSubscriptionsProps) {
  const router = useRouter()
  const { t, i18n } = useProfileTranslation()
  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US"

  if (!isOwnProfile) return null

  const getPlanTypeIcon = (type: PlanType) => {
    switch (type) {
      case "SPORT_CENTER_MANAGER":
        return <Building2 className="size-5 text-primary" />
      case "GROUP_OWNER":
        return <Users className="size-5 text-indigo-500" />
      case "SOCIAL_HOST":
        return <Sparkles className="size-5 text-amber-500" />
      case "TOURNAMENT_ORGANIZER":
        return <Trophy className="size-5 text-emerald-500" />
      default:
        return <Sparkles className="size-5 text-primary" />
    }
  }

  const hasSubscriptions = subscriptions && subscriptions.length > 0

  return (
    <div className="space-y-4">
      {hasSubscriptions ? (
        <div className="animate-in rounded-2xl border bg-card p-6 text-card-foreground shadow duration-300 fade-in">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-foreground">
              {t("registeredSubscriptions")}
            </h3>
            <Button
              onClick={() => router.push("/subscriptions")}
              size="sm"
              className="rounded-xl font-semibold shadow-xs"
            >
              <Plus className="size-3.5" />
              {t("registerMore")}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {subscriptions.map((sub) => {
              const isActive = sub.status === "ACTIVE"
              return (
                <div
                  key={sub.id}
                  className={`flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 ${
                    isActive
                      ? "border-primary/20 bg-primary/5 text-primary hover:border-primary/30"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanTypeIcon(sub.plan.type)}
                      <span className="text-base font-semibold text-foreground">
                        {sub.plan.name}
                      </span>
                    </div>
                    {/* <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        isActive
                          ? "border border-primary/20 bg-primary/10 text-primary"
                          : "border border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {isActive ? t("active") : t("expired")}
                    </span> */}
                  </div>
                  <div className="my-1 h-px bg-border/40" />
                  <p className="text-xs text-muted-foreground">
                    {t("expiresOn", {
                      date: new Date(sub.endDate).toLocaleDateString(locale),
                    })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div
          onClick={() => router.push("/subscriptions")}
          className="group relative animate-in cursor-pointer overflow-hidden rounded-2xl border bg-card p-6 shadow transition-all duration-300 fade-in hover:scale-[1.01] hover:shadow-md"
        >
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-1 items-start gap-4 md:items-center">
              <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/10">
                <Crown className="size-6 animate-pulse fill-amber-500/10" />
              </div>
              <div className="space-y-1">
                <h4 className="flex items-center gap-1.5 text-base font-bold text-foreground">
                  {t("noActiveSubTitle")}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("noActiveSubDesc")}
                </p>
              </div>
            </div>
            <Button className="shrink-0 rounded-xl font-semibold shadow-xs group-hover:translate-x-0.5">
              {t("upgradeNow")}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
