"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import type { LinkedProvider } from "@/features/auth/types"
import { EditProfileAccountCard } from "@/features/profile/components/edit-profile/edit-profile-account-card"
import { EditProfileAccountSettingsCard } from "@/features/profile/components/edit-profile/edit-profile-account-settings-card"
import { EditProfilePaymentCard } from "@/features/profile/components/edit-profile/edit-profile-payment-card"
import { EditProfilePlayerInfoCard } from "@/features/profile/components/edit-profile/edit-profile-player-info-card"
import { useProfileEditStore } from "@/features/profile/store/profile-edit-store"
import type { PaymentProfile, User } from "@/features/profile/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface EditProfileContentProps {
  initialUser: User | null
  initialLinkedProviders: LinkedProvider[]
  initialPaymentProfiles?: PaymentProfile[]
  sessionEmail: string
}

export function EditProfileContent({
  initialUser,
  initialLinkedProviders,
  initialPaymentProfiles = [],
  sessionEmail,
}: EditProfileContentProps) {
  const { t } = useProfileTranslation()
  const hasHydrated = useRef(false)
  const hydrateProfile = useProfileEditStore((state) => state.hydrateProfile)
  const user = useProfileEditStore((state) => state.user)
  const displayName = useProfileEditStore((state) => state.displayName)

  useEffect(() => {
    if (hasHydrated.current) {
      return
    }

    hydrateProfile({
      user: initialUser,
      linkedProviders: initialLinkedProviders,
      sessionEmail,
    })
    hasHydrated.current = true
  }, [hydrateProfile, initialLinkedProviders, initialUser, sessionEmail])

  const displayNameValue =
    displayName || sessionEmail.split("@")[0] || t("unnamedPlayer")
  const profileUser = user ?? initialUser

  return (
    <PageContainer className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold">{t("editProfile")}</h1>
          <Button variant="outline" asChild>
            <Link href="/profile">
              <ArrowLeft className="size-4" />
              {t("edit.avatar.done")}
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{t("edit.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <EditProfileAccountCard
            avatarUrl={profileUser?.avatarUrl}
            displayName={displayNameValue}
            email={sessionEmail}
          />
          <EditProfileAccountSettingsCard />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <EditProfilePlayerInfoCard user={profileUser} />
          <EditProfilePaymentCard
            initialPaymentProfiles={initialPaymentProfiles}
          />
        </div>
      </div>
    </PageContainer>
  )
}
