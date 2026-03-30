import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditPlayerInfoForm } from "@/features/profile/components/edit-player-info-form"
import type { ProfileDetails } from "@/features/profile/types"

export function EditProfilePlayerInfoCard({
  user,
}: {
  user: ProfileDetails | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin người chơi</CardTitle>
        <CardDescription>
          Cập nhật thông tin thể chất, trình độ và thói quen chơi của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EditPlayerInfoForm
          initialValues={{
            height: user?.height,
            weight: user?.weight,
            level: user?.level,
            playStyle: user?.playStyle,
            timeToPlay: user?.timeToPlay,
          }}
        />
      </CardContent>
    </Card>
  )
}
