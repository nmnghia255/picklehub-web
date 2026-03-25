import type { AuthUser } from "@/features/auth/types"

export async function ProfileCard({ user }: { user: AuthUser | null }) {
  const displayName = user?.name?.trim() || "Unnamed Player"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex gap-6 rounded-2xl bg-white p-6 shadow">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-300 text-xl font-semibold text-gray-700">
        {initials || "U"}
      </div>
      <div>
        <h2 className="text-xl font-bold">{displayName}</h2>
        <p className="text-gray-500">{user?.email || "No email available"}</p>
        {/* <p className="text-gray-500">Role: {user?.role || "N/A"}</p> */}
      </div>
    </div>
  )
}
