"use client"

import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { mockSocials } from "../../mock-data/mockData"
import type { Social } from "../../types"
import type { PlaySessionDraft, SocialFormData } from "./SocialForm.types"
import { SocialFormBasicInformationCard } from "./SocialFormBasicInformationCard"
import { SocialFormHeader } from "./SocialFormHeader"
import { SocialFormParticipationRulesCard } from "./SocialFormParticipationRulesCard"
import { SocialFormPaymentCard } from "./SocialFormPaymentCard"
import { SocialFormPlaySessionsCard } from "./SocialFormPlaySessionsCard"
import { SocialFormScheduleCard } from "./SocialFormScheduleCard"
import { SocialFormSidebar } from "./SocialFormSidebar"

function createInitialFormData(): SocialFormData {
  return {
    title: "",
    note: "",
    format: "SOCIAL",
    startTime: "",
    endTime: "",
    genderPolicy: "MIXED",
    ageGroup: "ADULT",
    minimumLevel: 2.0,
    maximumLevel: 4.0,
    maxSlots: 24,
    hostRole: "HOST_AND_PLAY",
    isPrivate: false,
    autoApproveJoinRequests: true,
    submitDupr: false,
    cancellationFreezeHours: 24,
    totalExpense: 0,
    paymentCode: "",
    paymentNote: "",
    status: "DRAFT",
  }
}

function mapSocialToFormData(social: Social): SocialFormData {
  return {
    title: social.title,
    note: social.note,
    format: social.format,
    startTime: new Date(social.startTime).toISOString().slice(0, 16),
    endTime: new Date(social.endTime).toISOString().slice(0, 16),
    genderPolicy: social.genderPolicy,
    ageGroup: social.ageGroup,
    minimumLevel: social.minimumLevel || 2.0,
    maximumLevel: social.maximumLevel || 4.0,
    maxSlots: social.maxSlots,
    hostRole: social.hostRole,
    isPrivate: social.isPrivate,
    autoApproveJoinRequests: social.autoApproveJoinRequests,
    submitDupr: social.submitDupr,
    cancellationFreezeHours: social.cancellationFreezeHours,
    totalExpense: social.totalExpense || 0,
    paymentCode: social.paymentCode || "",
    paymentNote: social.paymentNote || "",
    status: social.status,
  }
}

export function SocialForm() {
  const { t } = useSocialsTranslation()
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id as string | undefined
  const isEditMode = Boolean(id)
  const social = isEditMode ? mockSocials.find((s) => s.id === id) : null

  const [formData, setFormData] = useState<SocialFormData>(
    createInitialFormData
  )
  const [playSessions, setPlaySessions] = useState<PlaySessionDraft[]>([])

  useEffect(() => {
    if (!social) return

    startTransition(() => {
      setFormData(mapSocialToFormData(social))
    })
  }, [social])

  const handleSubmit = () => {
    console.log("Saving social:", formData, playSessions)
    alert(isEditMode ? t("form.updateSuccess") : t("form.createSuccess"))
    router.push("/socials")
  }

  const handleDelete = () => {
    if (confirm(t("form.confirmDeleteSocial"))) {
      alert(t("form.deleteSocial"))
      router.push("/socials")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <SocialFormHeader isEditMode={isEditMode} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SocialFormBasicInformationCard
            formData={formData}
            setFormData={setFormData}
          />
          <SocialFormScheduleCard
            formData={formData}
            setFormData={setFormData}
          />
          <SocialFormParticipationRulesCard
            formData={formData}
            setFormData={setFormData}
          />
          <SocialFormPaymentCard
            formData={formData}
            setFormData={setFormData}
          />
          <SocialFormPlaySessionsCard
            playSessions={playSessions}
            setPlaySessions={setPlaySessions}
            startTime={formData.startTime}
            endTime={formData.endTime}
          />
        </div>

        <SocialFormSidebar
          formData={formData}
          setFormData={setFormData}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export default function Page() {
  return <SocialForm />
}
