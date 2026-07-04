"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/hooks/use-session"
import { Mail, Phone, User } from "lucide-react"

export function LearnerProfile() {
  const session = useSession()
  const user = session?.user

  if (!session && user === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <User className="mb-2 size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Vui lòng đăng nhập để xem hồ sơ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ người học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar size="lg" className="size-20">
              <AvatarImage src={""} alt={user.name ?? "User"} />
              <AvatarFallback className="text-lg">
                {(user.name ?? "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{user.name ?? "Người dùng"}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                {user.email}
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4" />
                  {user.phoneNumber}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
