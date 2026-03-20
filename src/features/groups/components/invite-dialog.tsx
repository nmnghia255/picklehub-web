"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { startTransition, useActionState, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { inviteToGroupAction } from "../actions"
import { type InviteFormData, inviteSchema } from "../schemas"

interface InviteDialogProps {
  groupId: string
}

export function InviteDialog({ groupId }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    inviteToGroupAction.bind(null, groupId),
    {}
  )

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    if (!state.success) return
    const id = setTimeout(() => {
      setOpen(false)
      form.reset()
    })
    return () => clearTimeout(id)
  }, [state.success, form])

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    startTransition(() => formAction(fd))
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="size-4" />
          Mời qua email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Mời thành viên qua Email</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
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
