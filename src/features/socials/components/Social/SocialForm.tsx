"use client"

import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  socialQueryKeys,
  useSocialDetailQuery,
} from "../../api/social-queries"
import { socialService } from "../../api/social-service.client"
import type { Social } from "../../types"
import type { PlaySessionDraft, SocialFormData } from "./SocialForm.types"
import { SocialFormBasicInformationCard } from "./SocialFormBasicInformationCard"
import { SocialFormHeader } from "./SocialFormHeader"
import { SocialFormParticipationRulesCard } from "./SocialFormParticipationRulesCard"
import { SocialFormPaymentCard } from "./SocialFormPaymentCard"
import { SocialFormPlaySessionsCard } from "./SocialFormPlaySessionsCard"
import { SocialFormScheduleCard } from "./SocialFormScheduleCard"
import { SocialFormSidebar } from "./SocialFormSidebar"

interface SocialFormProps {
  initialFormData?: Partial<SocialFormData>
  compact?: boolean
  redirectOnSuccess?: boolean
  invalidateQueriesOnSuccess?: boolean
  showPlaySessions?: boolean
  onCreated?: (social: Social) => void
  onUpdated?: (social: Social) => void
}

function createInitialFormData(initialFormData?: Partial<SocialFormData>): SocialFormData {
  return {
    groupId: "",
    title: "",
    note: "",
    format: "SOCIAL",
    startTime: "",
    endTime: "",
    genderPolicy: "ANY",
    ageGroup: "ANY",
    minimumLevel: 2.0,
    maximumLevel: 4.0,
    maxSlots: 24,
    hostRole: "HOST_AND_PLAY",
    isPrivate: false,
    autoApproveJoinRequests: true,
    submitDupr: false,
    cancellationFreezeHours: 24,
    totalExpense: 0,
    paymentQrUrl: "",
    paymentCode: "",
    paymentNote: "",
    status: "DRAFT",
    ...initialFormData,
  }
}

function mapSocialToFormData(social: Social): SocialFormData {
  return {
    groupId: social.groupId ?? "",
    title: social.title,
    note: social.note ?? "",
    format: social.format,
    startTime: social.startTime ? new Date(social.startTime).toISOString().slice(0, 16) : "",
    endTime: social.endTime ? new Date(social.endTime).toISOString().slice(0, 16) : "",
    genderPolicy: social.genderPolicy,
    ageGroup: social.ageGroup,
    minimumLevel: social.minimumLevel ?? 2.0,
    maximumLevel: social.maximumLevel ?? 4.0,
    maxSlots: social.maxSlots,
    hostRole: social.hostRole,
    isPrivate: social.isPrivate,
    autoApproveJoinRequests: social.autoApproveJoinRequests,
    submitDupr: social.submitDupr,
    cancellationFreezeHours: social.cancellationFreezeHours ?? 0,
    totalExpense: social.totalExpense ?? 0,
    paymentQrUrl: social.paymentQrUrl ?? "",
    paymentCode: social.paymentCode ?? "",
    paymentNote: social.paymentNote ?? "",
    status: social.status,
  }
}

export function SocialForm({
  initialFormData,
  compact = false,
  redirectOnSuccess = true,
  invalidateQueriesOnSuccess = true,
  showPlaySessions = true,
  onCreated,
  onUpdated,
}: SocialFormProps) {
  const { t } = useSocialsTranslation()
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id as string | undefined
  const isEditMode = Boolean(id)
  const queryClient = useQueryClient()
  const { data: social } = useSocialDetailQuery(id)

  const [formData, setFormData] = useState<SocialFormData>(
    () => createInitialFormData(initialFormData)
  )
  const [playSessions, setPlaySessions] = useState<PlaySessionDraft[]>([])

  const createMutation = useMutation({
    mutationFn: socialService.createSocial,
    onSuccess: async (createdSocial) => {
      if (invalidateQueriesOnSuccess) {
        await queryClient.invalidateQueries({ queryKey: socialQueryKeys.all })
      }
      if (redirectOnSuccess) {
        router.push(`/socials/${createdSocial.id}`)
      }
      onCreated?.(createdSocial)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: ReturnType<typeof buildPayload> }) =>
      socialService.updateSocial(payload.id, payload.data),
    onSuccess: async (updatedSocial) => {
      if (invalidateQueriesOnSuccess) {
        await queryClient.invalidateQueries({ queryKey: socialQueryKeys.all })
      }
      if (redirectOnSuccess) {
        router.push(`/socials/${updatedSocial.id}`)
      }
      onUpdated?.(updatedSocial)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: socialService.deleteSocial,
    onSuccess: async () => {
      if (invalidateQueriesOnSuccess) {
        await queryClient.invalidateQueries({ queryKey: socialQueryKeys.all })
      }
      router.push("/socials")
    },
  })

  useEffect(() => {
    if (!social) return

    startTransition(() => {
      setFormData(mapSocialToFormData(social))
    })
  }, [social])

  useEffect(() => {
    if (social) return
    if (!initialFormData) return

    startTransition(() => {
      setFormData((prev) => ({ ...prev, ...initialFormData }))
    })
  }, [initialFormData, social])

  function buildPayload() {
    return {
      groupId: formData.groupId.trim() || undefined,
      title: formData.title,
      note: formData.note.trim() || undefined,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
      format: formData.format,
      isPrivate: formData.isPrivate,
      maxSlots: formData.maxSlots,
      submitDupr: formData.submitDupr,
      minimumLevel: Number.isFinite(formData.minimumLevel) ? formData.minimumLevel : undefined,
      maximumLevel: Number.isFinite(formData.maximumLevel) ? formData.maximumLevel : undefined,
      genderPolicy: formData.genderPolicy,
      ageGroup: formData.ageGroup,
      hostRole: formData.hostRole,
      cancellationFreezeHours: Number.isFinite(formData.cancellationFreezeHours)
        ? formData.cancellationFreezeHours
        : undefined,
      autoApproveJoinRequests: formData.autoApproveJoinRequests,
      paymentQrUrl: formData.paymentQrUrl.trim() || undefined,
      paymentCode: formData.paymentCode.trim() || undefined,
      paymentNote: formData.paymentNote.trim() || undefined,
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, data: payload })
      return
    }
    await createMutation.mutateAsync(payload)
  }

  const handleDelete = async () => {
    if (!id) {
      return
    }
    if (confirm(t("form.confirmDeleteSocial"))) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className={compact ? "space-y-6" : "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"}>
      {!compact && <SocialFormHeader isEditMode={isEditMode} />}

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
          {showPlaySessions && (
            <SocialFormPlaySessionsCard
              playSessions={playSessions}
              setPlaySessions={setPlaySessions}
              startTime={formData.startTime}
              endTime={formData.endTime}
            />
          )}
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
