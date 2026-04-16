import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CreatePlaySessionForm } from "@/features/play-sessions/components/create-play-session-form"

interface CreatePlaySessionPageProps {
  params: Promise<{ groupId: string }>
}

export default async function CreatePlaySessionPage({
  params,
}: CreatePlaySessionPageProps) {
  const { groupId } = await params

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Tạo buổi chơi mới</h1>
      </div>

      <CreatePlaySessionForm groupId={groupId} />
    </div>
  )
}
