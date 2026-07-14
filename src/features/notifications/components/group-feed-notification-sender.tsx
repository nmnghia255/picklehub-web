"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import { Bell, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
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

function createSchema(t: (key: string) => string) {
  return z.object({
    title: z
      .string()
      .min(1, t("notifications.sender.validation.title"))
      .max(200),
    message: z
      .string()
      .min(1, t("notifications.sender.validation.message"))
      .max(1000),
  })
}

type SendNotificationFormValues = z.infer<ReturnType<typeof createSchema>>

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
  const { i18n } = useTranslation("common")
  const { t: tGroups } = useGroupsTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, setNotifications] = useAtom(notificationFeedAtom)
  const [, setGroupNotifications] = useAtom(groupFeedNotificationsAtom)
  const { toast } = useToast()
  const sendNotificationSchema = createSchema(tGroups)

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
        title: tGroups(
          "notifications.noPermission",
          "Chỉ trưởng nhóm mới có thể gửi thông báo!"
        ),
        description: tGroups(
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
      const timeLabel = now.toLocaleString(
        i18n.language.startsWith("vi") ? "vi-VN" : i18n.language || undefined
      )

      const optimisticNotification: FeedNotification = {
        id: `group-notification-${groupId}-${now.getTime()}`,
        type: "group",
        groupId,
        section: "today",
        title: data.title,
        description: data.message,
        actor: groupName,
        timeLabel,
        unread: true,
        tags: [tGroups("feed.tags.group"), tGroups("feed.tags.notification")],
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
        title: tGroups("notifications.sendSuccess", "Thành công"),
        description: tGroups(
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
          : tGroups("notifications.sendFailed", "Không thể gửi thông báo")

      toast({
        title: tGroups("errors.defaultError", "Lỗi"),
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
          {tGroups("notifications.sendBtn", "Gửi thông báo")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tGroups("notifications.sendDialogTitle", "Gửi thông báo cho nhóm")}
          </DialogTitle>
          <DialogDescription>
            {tGroups(
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
                    {tGroups("notifications.formFieldTitle", "Tiêu đề")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tGroups(
                        "notifications.formFieldTitlePlaceholder",
                        "Nhập tiêu đề thông báo..."
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {tGroups(
                      "notifications.formFieldTitleDesc",
                      "Tối đa 200 ký tự"
                    )}
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
                    {tGroups("notifications.formFieldMessage", "Nội dung")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tGroups(
                        "notifications.formFieldMessagePlaceholder",
                        "Nhập nội dung thông báo..."
                      )}
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {tGroups(
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
                {tGroups("activitySchedule.btnCancel", "Hủy")}
              </Button>
              <Button type="submit" disabled={isLoading} variant="orangeCard">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {tGroups("notifications.sendBtn", "Gửi thông báo")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
