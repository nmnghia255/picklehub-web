import { UserRound } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function EditProfileAccountCard({
  displayName,
  email,
  userId,
}: {
  displayName: string
  email: string
  userId: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" />
          Tài khoản
        </CardTitle>
        <CardDescription>Thông tin cơ bản cho hồ sơ của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Tên</p>
          <p className="font-medium">{displayName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">User ID</p>
          <p className="font-mono text-sm break-all">{userId}</p>
        </div>
      </CardContent>
    </Card>
  )
}
