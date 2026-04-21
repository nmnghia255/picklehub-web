import Link from "next/link"

import { Button } from "@/components/ui/button"

export function ProfileHeader({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const displayName = name || "Unnamed Player"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary via-primary/90 to-primary/70 text-3xl font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] ring-4 ring-background/80">
          {initials || "U"}
        </div>

        {/* User Info */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>

          <p className="text-muted-foreground">{email}</p>
        </div>
      </div>
      <Button>
        <Link href="/settings/edit-profile">Sửa hồ sơ</Link>
      </Button>
    </div>
  )
}
