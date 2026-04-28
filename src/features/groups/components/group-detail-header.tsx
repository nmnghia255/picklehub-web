import { Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { LeaveGroupButton } from "./group-member-actions"
import { InviteDialog } from "./invite-dialog"

interface GroupDetailHeaderProps {
  groupId: string
  groupName: string
  isOwner: boolean
}

export function GroupDetailHeader({
  groupId,
  groupName,
  isOwner,
}: GroupDetailHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{groupName}</h1>
      <div className="flex gap-2">
        <Link href={`/groups/${groupId}/create-play-session`}>
          <Button variant="default" size="sm">
            <Plus className="mr-2 size-4" />
            Tạo buổi chơi
          </Button>
        </Link>
        {!isOwner && <LeaveGroupButton groupId={groupId} />}
        {isOwner && <InviteDialog groupId={groupId} />}
      </div>
    </div>
  )
}
