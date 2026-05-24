"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export function SocialFormHeader({ isEditMode }: { isEditMode: boolean }) {
  const { t } = useSocialsTranslation()
  const router = useRouter()

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEditMode ? t("form.editTitle") : t("form.createTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("form.subtitle")}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 self-start"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("matches.creation.back")}
      </Button>
    </div>
  )
}
