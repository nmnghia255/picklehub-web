"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Settings2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { updateGroupAction } from "../actions"
import { type UpdateGroupFormData, updateGroupSchema } from "../schemas"
import type { Group } from "../types"

interface EditGroupDrawerProps {
  group: Group
}

export function EditGroupDrawer({ group }: EditGroupDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    updateGroupAction.bind(null, group.id),
    {}
  )

  const form = useForm<UpdateGroupFormData>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      name: group.name,
      description: group.description ?? "",
      avatarUrl: group.avatarUrl ?? "",
      maxMembers: group.maxMembers ?? 50,
    },
  })

  useEffect(() => {
    if (!state.success) return

    toast.success("Cập nhật thông tin nhóm thành công")
    setTimeout(() => {
      setOpen(false)
      router.refresh()
    }, 0)
  }, [state.success, router])

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
  }, [state.error])

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    if (data.name) fd.set("name", data.name)
    if (data.description !== undefined) fd.set("description", data.description)
    if (data.avatarUrl !== undefined) fd.set("avatarUrl", data.avatarUrl)
    if (data.avatarFile) fd.set("avatarFile", data.avatarFile)
    if (data.maxMembers !== undefined)
      fd.set("maxMembers", data.maxMembers.toString())

    startTransition(() => formAction(fd))
  })

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Settings2 className="size-4" />
          Chỉnh sửa nhóm
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <DrawerHeader>
            <DrawerTitle>Chỉnh sửa thông tin nhóm</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-name">Tên nhóm</FieldLabel>
                <Input
                  id="edit-name"
                  placeholder="Nhập tên nhóm"
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-description">Mô tả</FieldLabel>
                <Textarea
                  id="edit-description"
                  placeholder="Nhập mô tả nhóm"
                  rows={4}
                  {...form.register("description")}
                  aria-invalid={!!form.formState.errors.description}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-avatar">Ảnh đại diện</FieldLabel>
                <Input
                  id="edit-avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      form.setValue("avatarFile", file)
                    }
                  }}
                />
                {form.formState.errors.avatarUrl && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.avatarUrl.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-maxMembers">
                  Số lượng thành viên tối đa
                </FieldLabel>
                <Input
                  id="edit-maxMembers"
                  type="number"
                  placeholder="50"
                  {...form.register("maxMembers")}
                  aria-invalid={!!form.formState.errors.maxMembers}
                />
                {form.formState.errors.maxMembers && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.maxMembers.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button">
                Hủy
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
