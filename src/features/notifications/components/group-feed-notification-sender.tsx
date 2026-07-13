"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import { Bell, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import type { FeedNotification } from "@/features/feed/types"
import { sendGroupFeedNotificationAction } from "@/features/notifications/actions/notifications"
import { groupFeedNotificationsAtom } from "@/features/notifications/store/group-feed-store"
import { useToast } from "@/hooks/use-toast"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

const sendNotificationSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  message: z.string().min(1, "Nội dung không được để trống").max(1000),
})

type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>

interface GroupFeedNotificationSenderProps {
  groupId: string
  groupName: string
  canSend?: boolean
}

export function GroupFeedNotificationSender({
  groupId,
  groupName,
  canSend = true,
}: GroupFeedNotificationSenderProps) {
  const { t } = useGroupsTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, setNotifications] = useAtom(notificationFeedAtom)
  const [, setGroupNotifications] = useAtom(groupFeedNotificationsAtom)
  const { toast } = useToast()

  const form = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  })

  const onSubmit = async (data: SendNotificationFormValues) => {
    if (!canSend) {
      toast({
        title: t(
          "notifications.noPermission",
          "Chỉ trưởng nhóm mới có thể gửi thông báo!"
        ),
        description: t(
          "notifications.noPermissionDesc",
          "Chỉ trưởng nhóm mới có thể gửi thông báo!"
        ),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await sendGroupFeedNotificationAction({
        groupId,
        title: data.title,
        message: data.message,
      })

      const now = new Date()
      const timeLabel = now.toLocaleString("vi-VN")

      const optimisticNotification: FeedNotification = {
        id: `group-notification-${groupId}-${now.getTime()}`,
        type: "group",
        groupId,
        section: "Hôm nay",
        title: data.title,
        description: data.message,
        actor: groupName,
        timeLabel,
        unread: true,
        tags: ["Nhóm", "Thông báo"],
        actionHref: `/groups/${groupId}`,
      }

      setNotifications((current) => [optimisticNotification, ...current])
      setGroupNotifications((current) => [
        {
          id: optimisticNotification.id,
          groupId,
          title: data.title,
          message: data.message,
          sentAt: now.toISOString(),
          timeLabel,
          senderName: groupName,
        },
        ...current,
      ])

      toast({
        title: t("notifications.sendSuccess", "Thành công"),
        description: t(
          "notifications.sendSuccessDesc",
          "Thông báo đã được gửi đến tất cả thành viên nhóm."
        ),
      })

      form.reset()
      setIsOpen(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("notifications.sendFailed", "Không thể gửi thông báo")

      toast({
        title: t("errors.defaultError", "Lỗi"),
        description: errorMessage,
        variant: "destructive",
      })

      console.error("Error sending notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!canSend) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Bell className="size-4" />
          {t("notifications.sendBtn", "Gửi thông báo")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("notifications.sendDialogTitle", "Gửi thông báo cho nhóm")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "notifications.sendDialogDesc",
              'Gửi thông báo feed tới tất cả thành viên của nhóm "{{name}}"',
              { name: groupName }
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("notifications.formFieldTitle", "Tiêu đề")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "notifications.formFieldTitlePlaceholder",
                        "Nhập tiêu đề thông báo..."
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("notifications.formFieldTitleDesc", "Tối đa 200 ký tự")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("notifications.formFieldMessage", "Nội dung")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "notifications.formFieldMessagePlaceholder",
                        "Nhập nội dung thông báo..."
                      )}
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      "notifications.formFieldMessageDesc",
                      "Tối đa 1000 ký tự"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                {t("activitySchedule.btnCancel", "Hủy")}
              </Button>
              <Button type="submit" disabled={isLoading} variant="orangeCard">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("notifications.sendBtn", "Gửi thông báo")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
