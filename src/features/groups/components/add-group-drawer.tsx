"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

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

import { addGroupAction } from "../actions"
import { type AddGroupFormData, addGroupSchema } from "../schemas"

export function AddGroupDrawer() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addGroupAction, {})

  const form = useForm<AddGroupFormData>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (!state.success) return

    const id = setTimeout(() => {
      setOpen(false)
      form.reset()
      router.refresh()
    })

    return () => clearTimeout(id)
  }, [state.success, form, router])

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("name", data.name)
    fd.set("description", data.description)
    startTransition(() => formAction(fd))
  })

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Tạo nhóm
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <DrawerHeader>
            <DrawerTitle>Tạo nhóm mới</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Tên nhóm</FieldLabel>
                <Input
                  id="name"
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
                <FieldLabel htmlFor="description">Mô tả</FieldLabel>
                <Textarea
                  id="description"
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

              {state.error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{state.error}</p>
                </div>
              )}
            </FieldGroup>
          </div>

          <DrawerFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo nhóm"}
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
