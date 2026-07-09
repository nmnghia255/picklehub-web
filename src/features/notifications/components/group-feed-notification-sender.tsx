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
  const { t, i18n } = useTranslation("common")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, setNotifications] = useAtom(notificationFeedAtom)
  const [, setGroupNotifications] = useAtom(groupFeedNotificationsAtom)
  const { toast } = useToast()
  const sendNotificationSchema = createSchema(t)

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
        title: t("notifications.sender.noPermission.title"),
        description: t("notifications.sender.noPermission.description"),
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
        tags: [t("feed.tags.group"), t("feed.tags.notification")],
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
        title: t("notifications.sender.success.title"),
        description: t("notifications.sender.success.description"),
      })

      form.reset()
      setIsOpen(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("notifications.sender.error.generic")

      toast({
        title: t("notifications.sender.error.title"),
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
        <Button variant="outline" size="sm">
          <Bell className="size-4" />
          {t("notifications.sender.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("notifications.sender.dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("notifications.sender.dialog.description")}
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
                    {t("notifications.sender.fields.title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "notifications.sender.fields.titlePlaceholder"
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("notifications.sender.fields.titleHelp")}
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
                    {t("notifications.sender.fields.message")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "notifications.sender.fields.messagePlaceholder"
                      )}
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("notifications.sender.fields.messageHelp")}
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
                {t("notifications.sender.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("notifications.sender.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
