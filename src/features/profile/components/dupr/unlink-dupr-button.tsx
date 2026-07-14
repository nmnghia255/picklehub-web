"use client"

import { Unlink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { unlinkDuprAction } from "@/features/profile/actions/dupr-actions"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

function translateMessage(
  message: string | undefined,
  t: (key: string) => string
): string {
  if (!message) return ""
  return message.startsWith("duprCard.") ? t(message) : message
}

export function UnlinkDuprButton({ duprId }: { duprId: string }) {
  const { t } = useProfileTranslation()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleUnlink = async () => {
    setIsPending(true)
    const result = await unlinkDuprAction()
    setIsPending(false)

    if (result.success) {
      toast.success(translateMessage(result.message, t))
      router.refresh()
      return
    }

    toast.error(translateMessage(result.error, t))
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="w-full gap-1.5 sm:w-auto"
        >
          <Unlink className="size-3.5" />
          {t("duprCard.unlinkAction")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("duprCard.unlink.title")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              {t("duprCard.unlink.description", { duprId })}
            </span>
            <span className="block">{t("duprCard.unlink.warning")}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("duprCard.unlink.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnlink} disabled={isPending}>
            {isPending
              ? t("duprCard.unlink.unlinking")
              : t("duprCard.unlink.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
