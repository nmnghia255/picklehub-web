"use client"

import { useParams, useRouter } from "next/navigation"

import { SocialForm } from "@/features/socials/components/social-form"
import { mockSocials } from "@/features/socials/mock-data/mockData"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export default function EditSocialPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const socialId = params.socialId as string | undefined

  const social = mockSocials.find((item) => item.id === socialId)

  if (!social && socialId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("detail.notFoundDescription")}
        </p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-sm"
          onClick={() => router.back()}
        >
          {t("detail.backToSocials")}
        </button>
      </div>
    )
  }

  return <SocialForm initialData={social} socialId={socialId} />
}
