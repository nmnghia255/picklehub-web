"use client"

import { useRouter } from "next/navigation"
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  joinPlaySessionAction,
  type JoinPlaySessionActionState,
} from "../actions/join-play-session"

interface JoinPlaySessionDialogProps {
  groupId: string
  sessionId: string
}

const initialState: JoinPlaySessionActionState = {}

export function JoinPlaySessionDialog({
  groupId,
  sessionId,
}: JoinPlaySessionDialogProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const [state, formAction, isPending] = useActionState(
    joinPlaySessionAction.bind(null, groupId, sessionId),
    initialState
  )

  useEffect(() => {
    if (!state.success) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(false)
      formRef.current?.reset()
      router.refresh()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [router, state.success])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => formAction(formData))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tham gia buổi chơi</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Tham gia buổi chơi</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="guestsCount">Số khách đi kèm</FieldLabel>
                <Input
                  id="guestsCount"
                  name="guestsCount"
                  type="number"
                  min={0}
                  max={5}
                  step={1}
                  defaultValue={0}
                  required
                />
                <FieldDescription>
                  Nhập từ 0 đến 5. Tổng số người đăng ký = bạn + số khách đi
                  kèm.
                </FieldDescription>
              </Field>

              {state.error && (
                <p className="text-sm text-destructive">
                  Đã có lỗi xảy ra. Vui lòng thử lại.
                </p>
              )}
            </FieldGroup>
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tham gia..." : "Xác nhận tham gia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
