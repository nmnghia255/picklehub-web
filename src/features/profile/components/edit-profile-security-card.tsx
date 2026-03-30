import { KeyRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { logoutAction } from "@/features/auth/actions"

export function EditProfileSecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" />
          Bảo mật
        </CardTitle>
        <CardDescription>Cập nhật mật khẩu hoặc đăng xuất.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/change-password">Đổi mật khẩu</Link>
        </Button>

        <form action={logoutAction} className="pt-1">
          <Button
            type="submit"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            Đăng xuất
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
