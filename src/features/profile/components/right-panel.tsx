import type { User } from "@/features/profile/types"

export function RightPanel({ user }: { user: User | null }) {
  const genderLabel =
    user?.gender === "MALE"
      ? "Nam"
      : user?.gender === "FEMALE"
        ? "Nữ"
        : user?.gender === "OTHER"
          ? "Khác"
          : "Chưa cập nhật"

  const preferredHandLabel =
    user?.preferredHand === "RIGHT"
      ? "Tay phải"
      : user?.preferredHand === "LEFT"
        ? "Tay trái"
        : user?.preferredHand === "AMBIDEXTROUS"
          ? "Hai tay"
          : "Chưa cập nhật"

  const selfRatingLabel =
    typeof user?.selfRating === "number"
      ? user.selfRating.toFixed(1)
      : "Chưa cập nhật"

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Giới thiệu
        </h3>
        <p className="text-sm leading-6 text-foreground/90">
          {user?.bio || "Người dùng chưa cập nhật phần giới thiệu."}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Thông tin người chơi
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">Giới tính</dt>
            <dd className="font-medium text-foreground">{genderLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">Tay thuận</dt>
            <dd className="font-medium text-foreground">
              {preferredHandLabel}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
            <dt className="text-muted-foreground">Tự đánh giá</dt>
            <dd className="font-medium text-foreground">{selfRatingLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          DUPR
        </h3>
        {user?.DuprProfile ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">DUPR ID</span>
              <span className="font-medium text-foreground">
                {user.DuprProfile.duprId}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Rating tổng</span>
              <span className="font-medium text-foreground">
                {user.DuprProfile.rating.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Singles</span>
              <span className="font-medium text-foreground">
                {user.DuprProfile.singlesRating.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Doubles</span>
              <span className="font-medium text-foreground">
                {user.DuprProfile.doublesRating.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa liên kết DUPR.</p>
        )}
      </div>
    </div>
  )
}
