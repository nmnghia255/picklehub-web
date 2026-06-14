"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditPlayerInfoForm } from "@/features/profile/components/edit-profile/edit-player-info-form"
import type { User } from "@/features/profile/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

export function EditProfilePlayerInfoCard({ user }: { user: User | null }) {
  const { t } = useProfileTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("edit.title")}</CardTitle>
        <CardDescription>{t("edit.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <EditPlayerInfoForm
          initialValues={{
            name: user?.fullName,
            avatarUrl: user?.avatarUrl,
            bio: user?.bio,
            gender: user?.gender,
            selfRating: user?.selfRating,
            preferredHand: user?.preferredHand,
          }}
        />
      </CardContent>
    </Card>
  )
}
