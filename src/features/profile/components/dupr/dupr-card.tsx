"use client"

import { Badge } from "@/components/ui/badge"
import type { MyDuprRating } from "@/features/profile/api/dupr-service"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

import { LinkDuprDialog } from "./link-dupr-dialog"
import { UnlinkDuprButton } from "./unlink-dupr-button"

// #region Rating row

function RatingRow({
  label,
  value,
  provisional,
  unratedLabel,
  provisionalLabel,
}: {
  label: string
  value: number | null | undefined
  provisional?: boolean
  unratedLabel: string
  provisionalLabel: string
}) {
  const isUnrated = typeof value !== "number"

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        {provisional && !isUnrated && (
          <Badge variant="secondary" className="font-normal">
            {provisionalLabel}
          </Badge>
        )}
        <span
          className={
            isUnrated
              ? "font-medium text-muted-foreground"
              : "font-medium text-foreground"
          }
        >
          {isUnrated ? unratedLabel : value.toFixed(2)}
        </span>
      </span>
    </div>
  )
}

// #endregion

export function DuprCard({
  rating,
  editable = false,
  defaultFullName,
  defaultEmail,
}: {
  rating: MyDuprRating | null
  // Only the profile owner may link/unlink; public views are read-only.
  editable?: boolean
  defaultFullName?: string
  defaultEmail?: string
}) {
  const { t, i18n } = useProfileTranslation()
  const locale = i18n.language === "vi" ? "vi-VN" : "en-US"

  const linked = Boolean(rating?.linked && rating?.duprId)
  const detail = rating?.rating
  const overall = detail ? (detail.doubles ?? detail.singles ?? null) : null
  const isProvisional = Boolean(
    detail && (detail.singlesProvisional || detail.doublesProvisional)
  )

  const unratedLabel = t("duprCard.unrated")
  const provisionalLabel = t("duprCard.provisional")

  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          {t("dupr")}
        </h3>
        {linked && isProvisional && (
          <Badge variant="secondary" className="font-normal">
            {provisionalLabel}
          </Badge>
        )}
      </div>

      {linked ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">{t("duprId")}</span>
            <span className="font-medium text-foreground">
              {rating?.duprId}
            </span>
          </div>

          <RatingRow
            label={t("rating")}
            value={overall}
            provisional={isProvisional}
            unratedLabel={unratedLabel}
            provisionalLabel={provisionalLabel}
          />
          <RatingRow
            label={t("singles")}
            value={detail?.singles}
            provisional={detail?.singlesProvisional}
            unratedLabel={unratedLabel}
            provisionalLabel={provisionalLabel}
          />
          <RatingRow
            label={t("doubles")}
            value={detail?.doubles}
            provisional={detail?.doublesProvisional}
            unratedLabel={unratedLabel}
            provisionalLabel={provisionalLabel}
          />

          {overall === null && (
            <p className="text-xs text-muted-foreground">
              {t("duprCard.unratedHint")}
            </p>
          )}
          {rating?.linkedAt && (
            <p className="text-xs text-muted-foreground">
              {t("duprCard.linkedOn", {
                date: new Date(rating.linkedAt).toLocaleDateString(locale),
              })}
            </p>
          )}

          {editable && rating?.duprId && (
            <div className="border-t pt-3">
              <UnlinkDuprButton duprId={rating.duprId} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("noDuprLink")}</p>
          {editable && (
            <LinkDuprDialog
              defaultFullName={defaultFullName}
              defaultEmail={defaultEmail}
            />
          )}
        </div>
      )}
    </div>
  )
}
