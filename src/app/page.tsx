import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Button asChild>
        <Link href="/settings/profile">Profile</Link>
      </Button>
    </div>
  )
}
