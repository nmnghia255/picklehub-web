import { ErrorSection } from "@/components/error-section"
import { getGroup } from "@/features/groups/api/groups-service"
import { GroupChat } from "@/features/groups/components/group-chat"

interface GroupChatPageProps {
  params: { groupId: string }
}

export default async function GroupChatPage({ params }: GroupChatPageProps) {
  const { groupId } = params

  let groupExists = true
  try {
    await getGroup(groupId)
  } catch (err) {
    // don't return 404 — show error but allow chat to render with mock data
    console.warn(
      "Could not fetch group for chat route, falling back to mock UI:",
      err
    )
    groupExists = false
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h2 className="mb-4 text-2xl font-semibold">Chat nhóm</h2>
      {!groupExists && (
        <ErrorSection message="Không tìm thấy nhóm trên server. Hiển thị giao diện chat ở chế độ mock." />
      )}
      <GroupChat groupId={groupId} />
    </div>
  )
}
