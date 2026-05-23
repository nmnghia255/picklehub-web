"use client"

import { Archive, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  DialogTrigger,
} from "@/components/ui/dialog"

import { archiveGroupAction } from "../actions"

interface ArchiveGroupDialogProps {
  groupId: string
  groupName: string
}

export function ArchiveGroupDialog({
  groupId,
  groupName,
}: ArchiveGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    archiveGroupAction.bind(null, groupId),
    {}
  )

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã lưu trữ nhóm "${groupName}".`)
      // Avoid calling setState synchronously inside an effect to prevent cascading renders
      setTimeout(() => setOpen(false), 0)
      router.refresh()
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [groupName, router, state.error, state.success])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Archive className="mr-2 size-4" />
          Lưu trữ nhóm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Lưu trữ nhóm</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn lưu trữ nhóm {'"'}
              {groupName}
              {'"'} không? Nhóm sẽ không còn hoạt động bình thường, dữ liệu sẽ
              không bị xóa và có thể khôi phục sau nếu hệ thống hỗ trợ.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending ? "Đang lưu trữ..." : "Lưu trữ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
