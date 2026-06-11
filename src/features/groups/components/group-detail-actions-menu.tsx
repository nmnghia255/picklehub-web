"use client"

import { Archive, LogOut, MoreHorizontal } from "lucide-react"
import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { archiveGroupAction, leaveGroupAction } from "../actions"

interface GroupDetailActionsMenuProps {
  groupId: string
  groupName: string
  isOwner: boolean
  isArchived: boolean
}

export function GroupDetailActionsMenu({
  groupId,
  groupName,
  isOwner,
  isArchived,
}: GroupDetailActionsMenuProps) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  const hasSecondaryActions = !isArchived

  if (!hasSecondaryActions) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-9 shrink-0">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Mở thao tác nhóm</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          {!isArchived && isOwner && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setArchiveOpen(true)}
            >
              <Archive className="size-4" />
              Lưu trữ nhóm
            </DropdownMenuItem>
          )}
          {!isArchived && !isOwner && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setLeaveOpen(true)}
            >
              <LogOut className="size-4" />
              Rời nhóm
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveGroupConfirmDialog
        groupId={groupId}
        groupName={groupName}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
      <LeaveGroupConfirmDialog
        groupId={groupId}
        groupName={groupName}
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
      />
    </>
  )
}

function ArchiveGroupConfirmDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    archiveGroupAction.bind(null, groupId),
    {}
  )

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã lưu trữ nhóm "${groupName}".`)
      setTimeout(() => onOpenChange(false), 0)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [groupName, onOpenChange, state.error, state.success])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Lưu trữ nhóm</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn lưu trữ nhóm &quot;{groupName}&quot; không? Thao
              tác này chỉ ẩn nhóm khỏi danh sách hoạt động.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Đang lưu trữ..." : "Lưu trữ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LeaveGroupConfirmDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(leaveGroupAction, {})

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã rời nhóm "${groupName}".`)
      setTimeout(() => onOpenChange(false), 0)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [groupName, onOpenChange, state.error, state.success])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <DialogHeader>
            <DialogTitle>Rời nhóm</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn rời khỏi nhóm &quot;{groupName}&quot; không?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Rời nhóm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
