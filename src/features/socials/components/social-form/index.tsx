"use client"

import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"
import { toast } from "sonner"

import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  createSocialAction,
  deleteSocialAction,
  updateSocialAction,
} from "../../actions/social-form-actions"
import type {
  CreateSocialRequest,
  SocialDetail,
  SocialFormData,
} from "../../types/social"
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
    isFree: false,
  }
}

function mapSocialToFormData(social: SocialDetail): SocialFormData {
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
    packageFee: social.packageFee,
    isFree: social.isFree,
    totalExpense: social.totalExpense,
    status: social.status,
  }
}

export interface SocialFormProps {
  initialData?: SocialDetail | null
  socialId?: string
}

export function SocialForm({ initialData, socialId }: SocialFormProps = {}) {
  const { t } = useSocialsTranslation()
  const params = useParams() as { id?: string; socialId?: string }
  const router = useRouter()
  const id = socialId || params.id || params.socialId
  const isEditMode = Boolean(id)
  const social = initialData ?? null
  const [formData, setFormData] = useState<SocialFormData>(
    createInitialFormData
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!social) return

    startTransition(() => {
      setFormData(mapSocialToFormData(social))
    })
  }, [social])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { startTime, endTime, hostRole, ...updateData } = formData

        // Ensure numeric fields are correctly typed
        updateData.minimumLevel =
          updateData.minimumLevel != null
            ? Number(updateData.minimumLevel)
            : null
        updateData.maximumLevel =
          updateData.maximumLevel != null
            ? Number(updateData.maximumLevel)
            : null
        updateData.packageFee =
          updateData.packageFee != null ? Number(updateData.packageFee) : null
        updateData.totalExpense =
          updateData.totalExpense != null
            ? Number(updateData.totalExpense)
            : undefined
        updateData.maxSlots =
          updateData.maxSlots != null ? Number(updateData.maxSlots) : 0
        updateData.cancellationFreezeHours =
          updateData.cancellationFreezeHours != null
            ? Number(updateData.cancellationFreezeHours)
            : null

        await updateSocialAction(id as string, {
          ...updateData,
          allowGuests: formData.allowGuests ?? true,
        })
        toast.success(t("form.updateSuccess"))
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { packageFee, totalExpense, status, allowGuests, ...createData } =
          formData

        // Ensure numeric fields are correctly typed
        createData.minimumLevel =
          createData.minimumLevel != null
            ? Number(createData.minimumLevel)
            : null
        createData.maximumLevel =
          createData.maximumLevel != null
            ? Number(createData.maximumLevel)
            : null
        createData.maxSlots =
          createData.maxSlots != null ? Number(createData.maxSlots) : 0
        createData.cancellationFreezeHours =
          createData.cancellationFreezeHours != null
            ? Number(createData.cancellationFreezeHours)
            : null

        await createSocialAction(createData)
        toast.success(t("form.createSuccess"))
      }
      router.push("/socials")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("form.submitError", {
              defaultValue: "Failed to save social event.",
            })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(t("form.confirmDeleteSocial"))) {
      setIsSubmitting(true)
      try {
        await deleteSocialAction(id as string)
        toast.success(t("form.deleteSocial"))
        router.push("/socials")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("form.deleteError", {
                defaultValue: "Failed to delete social event.",
              })
        )
      } finally {
        setIsSubmitting(false)
      }
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
            isEditMode={isEditMode}
          />
          <SocialFormParticipationRulesCard
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
          />
          <SocialFormPaymentCard
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
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
          isSubmitting={isSubmitting}
          onSubmit={() => void handleSubmit()}
          onDelete={() => void handleDelete()}
        />
      </div>
    </div>
  )
}

export default function Page() {
  return <SocialForm />
}
