"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { unlinkSocialAccountAction } from "@/features/auth/actions"
import type { SocialProvider } from "@/features/auth/types"
import { translateAuthMessage } from "@/features/auth/utils"

export function UnlinkSocialAccountButton({
  provider,
  providerLabel,
  linkedAt,
}: {
  provider: SocialProvider
  providerLabel: string
  linkedAt?: string | null
}) {
  const { t } = useTranslation("common")
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleUnlink = async () => {
    setIsPending(true)
    const result = await unlinkSocialAccountAction(provider)
    setIsPending(false)

    if (result.success) {
      toast.success(translateAuthMessage(t, result.message))
      router.refresh()
      return
    }

    toast.error(translateAuthMessage(t, result.error))
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={isPending}>
          {t("auth.social.unlink")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("auth.social.unlinkTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              {t("auth.social.unlinkDescription", {
                provider: providerLabel,
              })}
            </span>
            {linkedAt && (
              <span className="block">
                {t("auth.social.linkedAt", { date: linkedAt })}
              </span>
            )}
            <span className="block">{t("auth.social.unlinkWarning")}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("auth.social.unlinkCancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnlink} disabled={isPending}>
            {isPending ? t("auth.social.unlinking") : t("auth.social.unlink")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
