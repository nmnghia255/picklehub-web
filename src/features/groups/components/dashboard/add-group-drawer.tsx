"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { addGroupAction } from "../../actions"
import { type AddGroupFormData, addGroupSchema } from "../../schemas"

export function AddGroupDrawer() {
  const { t } = useGroupsTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(addGroupAction, {})
  const { data: subscriptions, isLoading } = useMySubscriptions()

  const handleTriggerClick = () => {
    if (isLoading) return
    const hasGroupPlan = subscriptions?.some(
      (sub) => sub.status === "ACTIVE" && sub.plan.type === "GROUP_OWNER"
    )
    if (hasGroupPlan) {
      setOpen(true)
    } else {
      setIsAlertOpen(true)
    }
  }

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
    <>
      <Button
        onClick={handleTriggerClick}
        disabled={isLoading}
        className="bg-orange-400 hover:bg-orange-500"
      >
        <Plus className="size-4" />
        {t("dashboard.createGroupBtn", "Tạo nhóm")}
      </Button>

      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <form className="flex h-full flex-col" onSubmit={onSubmit}>
            <DrawerHeader>
              <DrawerTitle>
                {t("dashboard.createGroupTitle", "Tạo nhóm mới")}
              </DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    {t("dashboard.groupNameLabel", "Tên nhóm")}
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder={t(
                      "dashboard.groupNamePlaceholder",
                      "Nhập tên nhóm"
                    )}
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
                  <FieldLabel htmlFor="description">
                    {t("dashboard.descriptionLabel", "Mô tả")}
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder={t(
                      "dashboard.descriptionPlaceholder",
                      "Nhập mô tả nhóm"
                    )}
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
                    <p className="text-sm text-red-600">
                      {t(state.error, state.error)}
                    </p>
                  </div>
                )}
              </FieldGroup>
            </div>

            <DrawerFooter>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t("dashboard.creatingGroupBtn", "Đang tạo...")
                  : t("dashboard.createGroupBtn", "Tạo nhóm")}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" type="button">
                  {t("activitySchedule.btnCancel")}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-500">
              {t("dashboard.subscriptionRequiredTitle", "Yêu cầu đăng ký gói")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "dashboard.subscriptionRequiredDesc",
                "Bạn cần đăng ký gói dịch vụ Trưởng nhóm để có thể tạo nhóm mới."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("activitySchedule.btnCancel", "Hủy")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-500! text-white hover:bg-orange-600!"
              onClick={() => router.push("/subscriptions")}
            >
              {t("dashboard.subscribeBtn", "Đăng ký ngay")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
