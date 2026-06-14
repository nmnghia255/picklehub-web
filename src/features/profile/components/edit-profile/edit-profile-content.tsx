"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import type { LinkedProvider } from "@/features/auth/types"
import { EditProfileAccountCard } from "@/features/profile/components/edit-profile/edit-profile-account-card"
import { EditProfileLinkedAccountsCard } from "@/features/profile/components/edit-profile/edit-profile-linked-accounts-card"
import { EditProfilePlayerInfoCard } from "@/features/profile/components/edit-profile/edit-profile-player-info-card"
import { EditProfileSecurityCard } from "@/features/profile/components/edit-profile/edit-profile-security-card"
import { useProfileEditStore } from "@/features/profile/store/profile-edit-store"
import type { User } from "@/features/profile/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface EditProfileContentProps {
  initialUser: User | null
  initialLinkedProviders: LinkedProvider[]
  sessionEmail: string
}

export function EditProfileContent({
  initialUser,
  initialLinkedProviders,
  sessionEmail,
}: EditProfileContentProps) {
  const { t } = useProfileTranslation()
  const hasHydrated = useRef(false)
  const hydrateProfile = useProfileEditStore((state) => state.hydrateProfile)
  const user = useProfileEditStore((state) => state.user)
  const linkedProviders = useProfileEditStore((state) => state.linkedProviders)
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
    displayName || sessionEmail.split("@")[0] || "Unnamed Player"
  const profileUser = user ?? initialUser
  const profileLinkedProviders =
    linkedProviders.length > 0 ? linkedProviders : initialLinkedProviders

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

      <div className="grid gap-6 md:grid-cols-2">
        <EditProfileAccountCard
          avatarUrl={profileUser?.avatarUrl}
          displayName={displayNameValue}
          email={sessionEmail}
        />
        <EditProfileLinkedAccountsCard
          linkedProviders={profileLinkedProviders}
        />
      </div>

      <EditProfilePlayerInfoCard user={profileUser} />
      <EditProfileSecurityCard />
    </PageContainer>
  )
}
