"use client"

import type { MyDuprRating } from "@/features/profile/api/dupr-service"
import { DuprCard } from "@/features/profile/components/dupr/dupr-card"
import type { User } from "@/features/profile/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

/**
 * Adapt the user-service DUPR mirror into the rating-service shape so public
 * profiles (which only carry the mirror) render through the same card. The
 * mirror doesn't track provisional/reliability, so those default to false/0.
 */
function mirrorToDuprRating(user: User | null): MyDuprRating | null {
  if (!user) return null
  if (!user.dupr) return { linked: false }

  const { dupr } = user
  return {
    linked: true,
    duprId: dupr.duprId,
    rating: {
      userId: user.id,
      duprId: dupr.duprId,
      singles: dupr.singlesRating,
      doubles: dupr.doublesRating,
      singlesProvisional: false,
      doublesProvisional: false,
      singlesReliability: 0,
      doublesReliability: 0,
      updatedAt: dupr.lastSyncedAt ?? "",
    },
  }
}

export function RightPanel({
  user,
  duprRating,
  editableDupr = false,
}: {
  user: User | null
  // Authoritative rating from rating-service (own profile). When omitted/null,
  // fall back to the mirror carried on `user` (public profile, read-only).
  duprRating?: MyDuprRating | null
  editableDupr?: boolean
}) {
  const { t } = useProfileTranslation()

  const dupr = duprRating ?? mirrorToDuprRating(user)

  const genderLabel =
    user?.gender === "MALE"
      ? t("genderMale")
      : user?.gender === "FEMALE"
        ? t("genderFemale")
        : user?.gender === "OTHER"
          ? t("genderOther")
          : t("genderUnspecified")

  const preferredHandLabel =
    user?.preferredHand === "RIGHT"
      ? t("handRight")
      : user?.preferredHand === "LEFT"
        ? t("handLeft")
        : user?.preferredHand === "AMBIDEXTROUS"
          ? t("handAmbidextrous")
          : t("handUnspecified")

  const selfRatingLabel =
    typeof user?.selfRating === "number"
      ? user.selfRating.toFixed(1)
      : t("handUnspecified")

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase">
          {t("about")}
        </h3>
        <p className="text-sm leading-6 text-foreground/90">
          {user?.bio || t("noBio")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase">
          {t("playerInfo")}
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">{t("gender")}</dt>
            <dd className="font-medium text-foreground">{genderLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">{t("preferredHand")}</dt>
            <dd className="font-medium text-foreground">
              {preferredHandLabel}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">{t("selfRating")}</dt>
            <dd className="font-medium text-foreground">{selfRatingLabel}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="shrink-0 whitespace-nowrap text-muted-foreground">
              {t("address")}
            </dt>
            <dd className="text-right font-medium text-balance wrap-break-word text-foreground">
              {user?.address || t("addressUnspecified")}
            </dd>
          </div>
        </dl>
      </div>

      <DuprCard
        rating={dupr}
        editable={editableDupr}
        defaultFullName={user?.fullName}
        defaultEmail={user?.email}
      />
    </div>
  )
}
