import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/actions"
import { LinkGoogleButton } from "@/features/auth/components/link-google-button"
import type { AuthUser } from "@/features/auth/types"
import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

export default async function ProfilePage() {
  const session = await getSession()
  // session.user is guaranteed non-null by (protected)/layout.tsx
  const sessionUser = session.user!

  let user: AuthUser | null = null
  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<AuthUser>("/api/auth/me")
    user = response.data
  } catch {
    // Fallback to session data if API call fails
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>

      <div className="space-y-4 rounded-lg border p-6">
        <div>
          <label className="text-sm font-medium text-gray-500">ID</label>
          <p className="mt-1 text-lg">{sessionUser.id}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="mt-1 text-lg">{user?.name ?? "—"}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1 text-lg">{sessionUser.email}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Liên kết tài khoản
          </h2>
          <LinkGoogleButton />
        </div>

        <div className="border-t pt-4">
          <form action={logoutAction}>
            <Button type="submit" variant="destructive" className="w-full">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
