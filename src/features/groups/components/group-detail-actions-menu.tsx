"use client"

import {
  Archive,
  CalendarDays,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  ReceiptText,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  archiveGroupAction,
  inviteToGroupAction,
  leaveGroupAction,
} from "../actions"

interface GroupDetailActionsMenuProps {
  groupId: string
  groupName: string
  isOwner: boolean
  isArchived: boolean
  showFinance: boolean
}

export function GroupDetailActionsMenu({
  groupId,
  groupName,
  isOwner,
  isArchived,
  showFinance,
}: GroupDetailActionsMenuProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleToggleFinance = () => {
    const nextParams = new URLSearchParams(searchParams.toString())

    if (showFinance) {
      nextParams.delete("showFinance")
    } else {
      nextParams.set("showFinance", "1")
    }

    const queryString = nextParams.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname)
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
          <DropdownMenuItem asChild>
            <Link href={`/groups/${groupId}/activity-schedule`}>
              <CalendarDays className="size-4" />
              Lịch nhóm
            </Link>
          </DropdownMenuItem>
          {!isArchived ? (
            <DropdownMenuItem asChild>
              <Link href={`/groups/${groupId}/create-play-session`}>
                <Plus className="size-4" />
                Tạo buổi chơi
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Plus className="size-4" />
              Tạo buổi chơi
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleToggleFinance}>
            <ReceiptText className="size-4" />
            {showFinance ? "Ẩn thu chi" : "Thu chi"}
          </DropdownMenuItem>
          {!isArchived && isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setInviteOpen(true)}>
                <Mail className="size-4" />
                Mời thành viên
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>
                <Archive className="size-4" />
                Lưu trữ nhóm
              </DropdownMenuItem>
            </>
          )}
          {!isOwner && !isArchived && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setLeaveOpen(true)}
              >
                <LogOut className="size-4" />
                Rời nhóm
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <InviteMemberDialog
        groupId={groupId}
        groupName={groupName}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
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

function InviteMemberDialog({
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
    inviteToGroupAction.bind(null, groupId),
    {}
  )

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã gửi lời mời vào nhóm "${groupName}".`)
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
            <DialogTitle>Mời thành viên</DialogTitle>
            <DialogDescription>
              Gửi lời mời qua email để thêm người vào nhóm &quot;{groupName}
              &quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                />
              </Field>
            </FieldGroup>
            {state.error && (
              <p className="mt-2 text-sm text-destructive">{state.error}</p>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi lời mời"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [state, formAction, isPending] = useActionState(
    leaveGroupAction.bind(null, groupId),
    {}
  )

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
