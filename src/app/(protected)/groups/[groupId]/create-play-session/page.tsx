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
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Tạo buổi chơi mới</h1>
      </div>

      <div className="flex justify-center">
        <CreatePlaySessionForm groupId={groupId} />
      </div>
    </div>
  )
}
