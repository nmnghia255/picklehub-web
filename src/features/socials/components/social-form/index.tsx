"use client"

import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { mockSocials } from "../../mock-data/mockData"
import type {
  CreateSocialRequest,
  ListSocial as Social,
} from "../../types/social"
// import type { PlaySessionDraft, SocialFormData } from "./SocialForm.types"
import { SocialFormBasicInformationCard } from "./social-form-basic-information-card"
import { SocialFormHeader } from "./social-form-header"
import { SocialFormParticipationRulesCard } from "./social-form-participation-rules-card"
import { SocialFormPaymentCard } from "./social-form-payment-card"
import { SocialFormScheduleCard } from "./social-form-schedule-card"
import { SocialFormSidebar } from "./social-form-sidebar"

function createInitialFormData(): CreateSocialRequest {
  return {
    title: "",
    note: "",
    startTime: "",
    endTime: "",
    format: "SOCIAL",
    isPrivate: false,
    maxSlots: 20,
    submitDupr: false,
    minimumLevel: 2,
    maximumLevel: 5,
    genderPolicy: "ANY",
    ageGroup: "ANY",
    hostRole: "HOST_AND_PLAY",
    cancellationFreezeHours: 2,
    autoApproveJoinRequests: true,
    paymentQrUrl: "",
    paymentBankName: "",
    paymentAccountNumber: "",
    paymentAccountName: "",
    paymentNote: "",
    pakageFee: null,
    isFree: false,
  }
}

function mapSocialToFormData(social: Social): CreateSocialRequest {
  return {
    title: social.title,
    note: social.note,
    startTime: new Date(social.startTime).toISOString().slice(0, 16),
    endTime: new Date(social.endTime).toISOString().slice(0, 16),
    format: social.format,
    isPrivate: social.isPrivate,
    maxSlots: social.maxSlots,
    submitDupr: social.submitDupr,
    minimumLevel: social.minimumLevel,
    maximumLevel: social.maximumLevel,
    genderPolicy: social.genderPolicy,
    ageGroup: social.ageGroup,
    hostRole: social.hostRole,
    cancellationFreezeHours: social.cancellationFreezeHours,
    autoApproveJoinRequests: social.autoApproveJoinRequests,
    paymentQrUrl: social.paymentQrUrl,
    paymentBankName: social.paymentBankName,
    paymentAccountNumber: social.paymentAccountNumber,
    paymentAccountName: social.paymentAccountName,
    paymentNote: social.paymentNote,
    pakageFee: social.packageFee,
    isFree: social.isFree,
  }
}

export interface SocialFormProps {
  initialData?: Social | null
  socialId?: string
}

export function SocialForm({ initialData, socialId }: SocialFormProps = {}) {
  const { t } = useSocialsTranslation()
  const params = useParams() as { id?: string; socialId?: string }
  const router = useRouter()
  const id = socialId || params.id || params.socialId
  const isEditMode = Boolean(id)
  const social =
    initialData !== undefined
      ? initialData
      : isEditMode
        ? mockSocials.find((s) => s.id === id)
        : null

  const [formData, setFormData] = useState<CreateSocialRequest>(
    createInitialFormData
  )
  useEffect(() => {
    if (!social) return

    startTransition(() => {
      setFormData(mapSocialToFormData(social))
    })
  }, [social])

  const handleSubmit = () => {
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
          {/* <SocialFormPlaySessionsCard
            playSessions={playSessions}
            setPlaySessions={setPlaySessions}
            startTime={formData.startTime}
            endTime={formData.endTime}
          /> */}
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
