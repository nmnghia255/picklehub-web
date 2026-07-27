"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { getPaymentProfilesAction } from "@/features/profile/actions/payment-profile-actions"
import type { PaymentProfile } from "@/features/profile/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"
import { cn } from "@/lib/utils"

export interface SelectedPaymentProfile {
  paymentBankName: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentQrUrl: string
}

interface PaymentSelectorProps {
  onSelectProfile: (profile: SelectedPaymentProfile) => void
  className?: string
}

export function PaymentSelector({
  onSelectProfile,
  className,
}: PaymentSelectorProps) {
  const { t } = useProfileTranslation()
  const [profiles, setProfiles] = useState<PaymentProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>("")

  useEffect(() => {
    let isMounted = true
    async function loadProfiles() {
      try {
        const data = await getPaymentProfilesAction()
        if (isMounted) {
          setProfiles(data || [])
        }
      } catch (err) {
        console.error("Failed to load payment profiles for selector:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    loadProfiles()
    return () => {
      isMounted = false
    }
  }, [])

  const handleValueChange = (id: string) => {
    setSelectedId(id)
    const profile = profiles.find((p) => p.id === id)
    if (profile) {
      onSelectProfile({
        paymentBankName: profile.paymentBankName || "",
        paymentAccountName: profile.paymentAccountName || "",
        paymentAccountNumber: profile.paymentAccountNumber || "",
        paymentQrUrl: profile.paymentQrUrl || "",
      })
      toast.success(
        t("paymentProfile.selector.autofilled", {
          bankName: profile.paymentBankName,
        })
      )
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 py-1 text-xs text-muted-foreground",
          className
        )}
      >
        <Spinner className="size-3.5 text-primary" />
        <span>{t("paymentProfile.selector.loading")}</span>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-3 text-xs text-muted-foreground dark:border-emerald-800/40 dark:bg-emerald-950/20",
          className
        )}
      >
        <span>{t("paymentProfile.selector.noProfiles")}</span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 text-xs font-semibold text-emerald-600 hover:bg-emerald-100/50 hover:text-emerald-700 dark:text-emerald-400"
        >
          <Link href="/profile/edit-profile" target="_blank">
            {t("paymentProfile.selector.createAccount")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 shadow-xs dark:border-emerald-800/40 dark:bg-emerald-950/20",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
          {t("paymentProfile.selector.label")}
        </span>
        <Link
          href="/profile/edit-profile"
          target="_blank"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {t("paymentProfile.selector.manage")}
        </Link>
      </div>

      <Select value={selectedId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full border-gray-300 bg-white text-xs shadow-2xs focus:ring-2 focus:ring-emerald-500 sm:text-sm dark:border-gray-700 dark:bg-background">
          <SelectValue placeholder={t("paymentProfile.selector.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {t("paymentProfile.selector.listLabel")}
            </SelectLabel>
            {profiles.map((profile) => (
              <SelectItem
                key={profile.id}
                value={profile.id}
                className="text-xs sm:text-sm"
              >
                <span className="font-semibold text-foreground">
                  {profile.paymentBankName}
                </span>{" "}
                — {profile.paymentAccountNumber} ({profile.paymentAccountName})
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
