import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditPlayerInfoForm } from "@/features/profile/components/edit-profile/edit-player-info-form"
import type { User } from "@/features/profile/types"

export function EditProfilePlayerInfoCard({ user }: { user: User | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>
          Cập nhật tên hiển thị, ảnh đại diện, giới thiệu, giới tính, tự đánh
          giá và tay thuận của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EditPlayerInfoForm
          initialValues={{
            name: user?.fullName,
            avatarUrl: user?.avatarUrl,
            bio: user?.bio,
            gender: user?.gender,
            selfRating: user?.selfRating,
            preferredHand: user?.preferredHand,
          }}
        />
      </CardContent>
    </Card>
  )
}
