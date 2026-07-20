"use client"

import { Link2, Loader2, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import {
  createInviteLinkAction,
  getInviteLinksAction,
  revokeInviteLinkAction,
} from "../../actions"
import type { InviteLink } from "../../types"

interface InviteLinksDrawerProps {
  groupId: string
}

export function InviteLinksDrawer({ groupId }: InviteLinksDrawerProps) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<InviteLink[]>([])
  const [isCreating, startCreating] = useTransition()
  const [isFetching, startFetching] = useTransition()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const fetchLinks = useCallback(() => {
    startFetching(async () => {
      const result = await getInviteLinksAction(groupId)
      if (result.data) {
        setLinks(result.data)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }, [groupId])

  useEffect(() => {
    if (open) fetchLinks()
  }, [open, fetchLinks])

  const handleRevoke = (linkId: string) => {
    setRevokingId(linkId)
    revokeInviteLinkAction(groupId, linkId).then((result) => {
      setRevokingId(null)
      if (result.success) {
        toast.success(t("inviteLinks.revokeSuccess"))
        fetchLinks()
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  const handleCreate = () => {
    startCreating(async () => {
      const result = await createInviteLinkAction(groupId)
      if (result.data) {
        try {
          await navigator.clipboard.writeText(result.data.inviteUrl)
          toast.success(t("inviteLinks.createCopied"))
        } catch {
          toast.success(
            t("inviteLinks.createSuccess", { url: result.data.inviteUrl })
          )
        }
        fetchLinks()
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Link2 className="size-4" />
          {t("inviteLinks.open")}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{t("inviteLinks.title")}</DrawerTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={fetchLinks}
            disabled={isFetching}
            aria-label={t("inviteLinks.reload")}
          >
            <RefreshCw className={isFetching ? "animate-spin" : ""} />
          </Button> */}
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {isCreating ? t("inviteLinks.creating") : t("inviteLinks.create")}
          </Button>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("inviteLinks.listTitle")}</p>
            {isFetching && links.length === 0 ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : links.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("inviteLinks.empty")}
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <p className="max-w-45 truncate font-mono text-xs text-muted-foreground">
                    {link.id}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        link.status === "pending" ? "default" : "destructive"
                      }
                    >
                      {link.status}
                    </Badge>
                    {link.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        disabled={revokingId === link.id}
                        onClick={() => handleRevoke(link.id)}
                        aria-label={t("inviteLinks.revoke")}
                      >
                        {revokingId === link.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
