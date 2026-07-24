"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../../api/sport-center-wizard-client"
import { sportCenterOwnerListQueryKey } from "../../queries"
import type {
  ProductType,
  ServiceType,
} from "../../services-products-management/types"
import type { CourtLifecycleStatus, CourtType } from "../../types/court"
import type { SportCenterStatus } from "../../types/sport-center"
import { Step1CenterInfo } from "./step-1-center-info"
import { Step2PriceSlots } from "./step-2-price-slots"
import { Step3Policy } from "./step-3-policy"
import { Step4Courts } from "./step-4-courts"
import { Step5Inventory } from "./step-5-inventory"
import { Step6Review } from "./step-6-review"
import {
  type CenterDraft,
  type CourtDraft,
  createId,
  draftCourtLabel,
  draftProductLabel,
  draftServiceLabel,
  isValidHttpUrl,
  type PolicyDraft,
  type PriceSlotDraft,
  type ProductDraft,
  type ServiceDraft,
  splitLines,
  timeToMinutes,
  type WizardStep,
} from "./types"
import { WizardStepper } from "./wizard-stepper"

export function CreateSportCenterWizard() {
  const router = useRouter()
  const { t } = useSportCenterManagementTranslation()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [centerId, setCenterId] = useState<string | null>(null)

  const [centerSnapshot, setCenterSnapshot] = useState<{
    id: string
    name: string
    address: string
    openTime: string
    closeTime: string
    basePrice: number
    paymentAccountName: string
    paymentAccountNumber: string
    paymentBankName: string
    paymentQrUrl?: string | null
    images?: string[]
    amenities?: string[]
    rules?: string[]
    description?: string | null
    status?: SportCenterStatus
  } | null>(null)

  const [centerDraft, setCenterDraft] = useState<CenterDraft>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    openTime: "08:00",
    closeTime: "22:00",
    basePrice: "",
    paymentAccountName: "",
    paymentAccountNumber: "",
    paymentBankName: "",
    paymentQrUrl: "",
    images: [],
    amenitiesText: "",
    rulesText: "",
  })

  const [priceSlots, setPriceSlots] = useState<PriceSlotDraft[]>([
    {
      id: createId(),
      startTime: "08:00",
      endTime: "22:00",
      pricePerHour: "",
    },
  ])
  const [priceSlotDeleteTarget, setPriceSlotDeleteTarget] =
    useState<PriceSlotDraft | null>(null)

  const [policy, setPolicy] = useState<PolicyDraft>({
    allowCancellation: true,
    tiers: [
      {
        id: createId(),
        minDaysBeforeStart: 2,
        refundPercent: 100,
      },
      {
        id: createId(),
        minDaysBeforeStart: 1,
        refundPercent: 75,
      },
    ],
  })

  const [courtDraft, setCourtDraft] = useState({
    name: "",
    type: "INDOOR" as CourtType,
    status: "ACTIVE" as CourtLifecycleStatus,
  })
  const [courtDrafts, setCourtDrafts] = useState<CourtDraft[]>([])

  const [serviceTab, setServiceTab] = useState<"service" | "product">("service")
  const [serviceDraft, setServiceDraft] = useState({
    name: "",
    type: "EQUIPMENT_RENTAL" as ServiceType,
    price: "",
    unit: "",
    description: "",
    imageUrl: "",
  })
  const [serviceDrafts, setServiceDrafts] = useState<ServiceDraft[]>([])

  const [productDraft, setProductDraft] = useState({
    name: "",
    type: "BEVERAGE" as ProductType,
    price: "",
    unit: "",
    stock: "",
    description: "",
    imageUrl: "",
  })
  const [productDrafts, setProductDrafts] = useState<ProductDraft[]>([])

  const getErrorMessage = (error: unknown, fallback: string): string => {
    let rawMsg: string | undefined

    if (typeof error === "string" && error.trim()) {
      rawMsg = error
    } else if (error && typeof error === "object") {
      const errObj = error as {
        response?: {
          data?: {
            message?: string | string[]
            error?: string
            details?: string
          }
        }
        message?: string
      }
      const apiMsg = errObj.response?.data?.message
      if (apiMsg) {
        rawMsg = Array.isArray(apiMsg) ? apiMsg.join(" | ") : apiMsg
      } else if (errObj.response?.data?.error) {
        rawMsg = errObj.response.data.error
      } else if (errObj.response?.data?.details) {
        rawMsg = errObj.response.data.details
      } else if (errObj.message) {
        rawMsg = errObj.message
      }
    }

    if (!rawMsg) rawMsg = fallback

    if (
      rawMsg.toLowerCase().includes("status code 409") ||
      rawMsg.includes("409")
    ) {
      return t("createCenter.validation.conflictError", {
        defaultValue:
          "Trung tâm thể thao với tên hoặc số điện thoại này đã tồn tại (Tên/SĐT bị trùng). Vui lòng kiểm tra lại.",
      })
    }

    return rawMsg
  }

  const setGlobalError = (errorMsg: unknown, fallback = "") => {
    const message =
      typeof errorMsg === "string"
        ? errorMsg
        : getErrorMessage(errorMsg, fallback)
    if (message) {
      toast.error(message)
    }
  }
  const [centerImagesUploading, setCenterImagesUploading] = useState(false)
  const [paymentQrUploading, setPaymentQrUploading] = useState(false)
  const [serviceImageUploading, setServiceImageUploading] = useState(false)
  const [productImageUploading, setProductImageUploading] = useState(false)

  const priceSlotDefaults = useMemo(
    () => ({
      startTime: centerDraft.openTime || "06:00",
      endTime: centerDraft.closeTime || "22:00",
      pricePerHour: centerDraft.basePrice || "0",
    }),
    [centerDraft.basePrice, centerDraft.closeTime, centerDraft.openTime]
  )

  const centerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: centerDraft.name.trim(),
        address: centerDraft.address.trim(),
        phone: centerDraft.phone.trim(),
        email: centerDraft.email.trim() || undefined,
        description: centerDraft.description.trim() || undefined,
        images: centerDraft.images,
        rules: splitLines(centerDraft.rulesText),
        openTime: centerDraft.openTime,
        closeTime: centerDraft.closeTime,
        basePrice: Number(centerDraft.basePrice),
        amenities: splitLines(centerDraft.amenitiesText),
        paymentAccountName: centerDraft.paymentAccountName.trim(),
        paymentAccountNumber: centerDraft.paymentAccountNumber.trim(),
        paymentBankName: centerDraft.paymentBankName.trim(),
        paymentQrUrl: centerDraft.paymentQrUrl.trim() || undefined,
      }

      if (centerId) {
        return sportCenterWizardClient.updateSportCenter(centerId, payload)
      }

      return sportCenterWizardClient.createSportCenter({
        ...payload,
        status: "ACTIVE",
      })
    },
    onSuccess: (data) => {
      setCenterId(data.id)
      setCenterSnapshot(data)
      setCenterDraft((current) => ({
        ...current,
        paymentQrUrl: data.paymentQrUrl ?? current.paymentQrUrl,
        images: data.images ?? current.images,
      }))
      toast.success(
        centerId
          ? t("createCenter.toast.centerUpdated", {
              defaultValue: "Sport center saved successfully.",
            })
          : t("createCenter.toast.centerCreated", {
              defaultValue: "Sport center created successfully.",
            })
      )
      setCurrentStep(2)
    },
    onError: (error) => {
      setGlobalError(
        error,
        t("createCenter.validation.centerSaveFailed", {
          defaultValue: "Could not save the sport center.",
        })
      )
    },
  })

  const priceSlotsMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))

      const normalized = priceSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricePerHour: Number(slot.pricePerHour),
      }))

      await sportCenterWizardClient.updatePriceSlots(centerId, {
        priceSlots: normalized,
      })

      return sportCenterWizardClient.listPriceSlots(centerId)
    },
    onSuccess: (savedSlots) => {
      setPriceSlots((current) =>
        current.map((slot) => {
          const saved = savedSlots.find(
            (item) =>
              item.startTime === slot.startTime &&
              item.endTime === slot.endTime &&
              item.pricePerHour === Number(slot.pricePerHour)
          )
          return saved ? { ...slot, serverId: saved.id } : slot
        })
      )
      toast.success(
        t("createCenter.toast.priceSlotsSaved", {
          defaultValue: "Price slots saved.",
        })
      )
      setCurrentStep(3)
    },
    onError: (error) => {
      setGlobalError(
        error,
        t("createCenter.validation.priceSlotsSaveFailed", {
          defaultValue: "Failed to save price slots.",
        })
      )
    },
  })

  const deletePriceSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))
      return sportCenterWizardClient.deletePriceSlot(centerId, slotId)
    },
    onSuccess: () => {
      const target = priceSlotDeleteTarget
      if (target) {
        setPriceSlots((current) =>
          current.filter(
            (slot) => slot.id !== target.id && slot.serverId !== target.serverId
          )
        )
      }
      setPriceSlotDeleteTarget(null)
      toast.success(
        t("createCenter.toast.priceSlotDeleted", {
          defaultValue: "Price slot deleted.",
        })
      )
    },
    onError: (error) => {
      setGlobalError(
        error,
        t("createCenter.toast.priceSlotDeleteFailed", {
          defaultValue: "Could not delete the price slot.",
        })
      )
    },
  })

  const policyMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))
      return sportCenterWizardClient.updateCancellationPolicy(centerId, {
        allowCancellation: policy.allowCancellation,
        tiers: policy.tiers.map((tier) => ({
          minDaysBeforeStart: Number(tier.minDaysBeforeStart),
          refundPercent: Number(tier.refundPercent),
        })),
      })
    },
    onSuccess: () => {
      toast.success(
        t("createCenter.toast.policySaved", {
          defaultValue: "Cancellation policy saved.",
        })
      )
      setCurrentStep(4)
    },
    onError: (error) => {
      setGlobalError(
        error,
        t("createCenter.validation.policySaveFailed", {
          defaultValue: "Failed to save cancellation policy.",
        })
      )
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!centerId) throw new Error(t("createCenter.validation.centerMissing"))

      const failures: string[] = []
      for (const court of courtDrafts) {
        if (court.serverId) continue
        try {
          const created = await sportCenterWizardClient.createCourt(centerId, {
            name: court.name.trim(),
            type: court.type,
            status: court.status,
          })
          setCourtDrafts((current) =>
            current.map((item) =>
              item.id === court.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${court.name || draftCourtLabel(0)}: ${message}`)
          setCourtDrafts((current) =>
            current.map((item) =>
              item.id === court.id ? { ...item, error: message } : item
            )
          )
        }
      }

      for (const service of serviceDrafts) {
        if (service.serverId) continue
        try {
          const created = await sportCenterWizardClient.createService(
            centerId,
            {
              name: service.name.trim(),
              type: service.type,
              price: Number(service.price),
              description: service.description.trim() || undefined,
              unit: service.unit.trim() || undefined,
              imageUrl: service.imageUrl.trim() || undefined,
            }
          )
          setServiceDrafts((current) =>
            current.map((item) =>
              item.id === service.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${service.name || draftServiceLabel(0)}: ${message}`)
          setServiceDrafts((current) =>
            current.map((item) =>
              item.id === service.id ? { ...item, error: message } : item
            )
          )
        }
      }

      for (const product of productDrafts) {
        if (product.serverId) continue
        try {
          const created = await sportCenterWizardClient.createProduct(
            centerId,
            {
              name: product.name.trim(),
              type: product.type,
              price: Number(product.price),
              description: product.description.trim() || undefined,
              unit: product.unit.trim() || undefined,
              imageUrl: product.imageUrl.trim() || undefined,
              stock: Number(product.stock),
            }
          )
          setProductDrafts((current) =>
            current.map((item) =>
              item.id === product.id
                ? { ...item, serverId: created.id, error: undefined }
                : item
            )
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed"
          failures.push(`${product.name || draftProductLabel(0)}: ${message}`)
          setProductDrafts((current) =>
            current.map((item) =>
              item.id === product.id ? { ...item, error: message } : item
            )
          )
        }
      }

      if (failures.length > 0) {
        throw new Error(failures.join(" | "))
      }

      const center = await sportCenterWizardClient.getSportCenter(centerId)

      const [courts, priceSlots, policy] = await Promise.all([
        courtDrafts.length > 0
          ? sportCenterWizardClient.listCourts(centerId)
          : Promise.resolve([]),
        sportCenterWizardClient.listPriceSlots(centerId),
        sportCenterWizardClient.getCancellationPolicy(centerId),
      ])

      const [services, products] =
        center.status === "ACTIVE"
          ? await Promise.all([
              sportCenterWizardClient.listServices(centerId),
              sportCenterWizardClient.listProducts(centerId),
            ])
          : [[], []]

      return { center, courts, priceSlots, policy, services, products }
    },
    onSuccess: (result) => {
      setCenterSnapshot(result.center)
      queryClient.invalidateQueries({ queryKey: sportCenterOwnerListQueryKey })
      toast.success(
        t("createCenter.toast.finalSuccess", {
          defaultValue: "Sport center setup completed.",
        })
      )
      router.push(`/sport-center-management/${result.center.id}`)
    },
    onError: (error) => {
      setGlobalError(
        error,
        t("createCenter.validation.finalSaveFailed", {
          defaultValue: "Could not complete setup.",
        })
      )
    },
  })

  const totalSteps = 6

  const steps = [
    {
      number: 1 as WizardStep,
      title: t("createCenter.steps.center", { defaultValue: "Center info" }),
    },
    {
      number: 2 as WizardStep,
      title: t("createCenter.steps.pricing", { defaultValue: "Price slots" }),
    },
    {
      number: 3 as WizardStep,
      title: t("createCenter.steps.policy", {
        defaultValue: "Cancellation policy",
      }),
    },
    {
      number: 4 as WizardStep,
      title: t("createCenter.steps.courts", { defaultValue: "Courts" }),
    },
    {
      number: 5 as WizardStep,
      title: t("createCenter.steps.inventory", {
        defaultValue: "Products & services",
      }),
    },
    {
      number: 6 as WizardStep,
      title: t("createCenter.steps.review", { defaultValue: "Review" }),
    },
  ]

  const centerPayloadReady =
    centerDraft.name.trim() &&
    centerDraft.address.trim() &&
    centerDraft.phone.trim() &&
    centerDraft.openTime &&
    centerDraft.closeTime &&
    centerDraft.basePrice &&
    centerDraft.paymentAccountName.trim() &&
    centerDraft.paymentAccountNumber.trim() &&
    centerDraft.paymentBankName.trim()

  const validateCenterStep = () => {
    if (!centerPayloadReady) {
      setGlobalError(
        t("createCenter.validation.requiredFields", {
          defaultValue: "Please fill in all required fields.",
        })
      )
      return false
    }

    const open = timeToMinutes(centerDraft.openTime)
    const close = timeToMinutes(centerDraft.closeTime)
    if (open === null || close === null || open >= close) {
      setGlobalError(
        t("createCenter.validation.timeOrder", {
          defaultValue: "Opening time must be earlier than closing time.",
        })
      )
      return false
    }

    if (Number(centerDraft.basePrice) < 0) {
      setGlobalError(
        t("createCenter.validation.priceInvalid", {
          defaultValue: "Base price is invalid.",
        })
      )
      return false
    }

    if (!isValidHttpUrl(centerDraft.paymentQrUrl)) {
      setGlobalError(
        t("createCenter.validation.invalidUrl", {
          defaultValue: "Please enter a valid URL.",
        })
      )
      return false
    }

    return true
  }

  const validatePriceSlots = () => {
    if (!priceSlots.length) {
      setGlobalError(
        t("createCenter.validation.atLeastOneSlot", {
          defaultValue: "Please add at least one price slot.",
        })
      )
      return false
    }

    const rows = priceSlots.map((slot) => ({
      ...slot,
      startMinutes: timeToMinutes(slot.startTime),
      endMinutes: timeToMinutes(slot.endTime),
      price: Number(slot.pricePerHour),
    }))

    for (const slot of rows) {
      if (slot.startMinutes === null || slot.endMinutes === null) {
        setGlobalError(
          t("createCenter.validation.invalidTime", {
            defaultValue: "Please enter a valid time.",
          })
        )
        return false
      }
      if (slot.startMinutes >= slot.endMinutes) {
        setGlobalError(
          t("createCenter.validation.timeOrder", {
            defaultValue: "Start time must be earlier than end time.",
          })
        )
        return false
      }
      if (
        !slot.pricePerHour ||
        !slot.pricePerHour.toString().trim() ||
        !Number.isFinite(slot.price) ||
        slot.price <= 0
      ) {
        setGlobalError(
          t("createCenter.validation.slotPriceRequired", {
            defaultValue:
              "Please enter a valid price (greater than 0) for all price slots.",
          })
        )
        return false
      }
    }

    const sorted = [...rows].sort((a, b) => a.startMinutes! - b.startMinutes!)
    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index].startMinutes! < sorted[index - 1].endMinutes!) {
        setGlobalError(
          t("createCenter.validation.noOverlap", {
            defaultValue: "Price slots cannot overlap.",
          })
        )
        return false
      }
    }

    return true
  }

  const validatePolicy = () => {
    if (!policy.allowCancellation) return true
    const rows = policy.tiers.map((tier) => ({
      minDaysBeforeStart: Number(tier.minDaysBeforeStart),
      refundPercent: Number(tier.refundPercent),
    }))

    for (const row of rows) {
      if (
        !Number.isInteger(row.minDaysBeforeStart) ||
        row.minDaysBeforeStart < 0 ||
        !Number.isFinite(row.refundPercent) ||
        row.refundPercent < 0 ||
        row.refundPercent > 100
      ) {
        setGlobalError(
          t("createCenter.validation.invalidTier", {
            defaultValue: "Please correct the cancellation policy tiers.",
          })
        )
        return false
      }
    }

    const sorted = [...rows].sort(
      (a, b) => b.minDaysBeforeStart - a.minDaysBeforeStart
    )
    for (let index = 1; index < sorted.length; index += 1) {
      if (
        sorted[index].minDaysBeforeStart ===
        sorted[index - 1].minDaysBeforeStart
      ) {
        setGlobalError(
          t("createCenter.validation.tierOrder", {
            defaultValue:
              "Cancellation policy tiers must not duplicate thresholds.",
          })
        )
        return false
      }
    }

    return true
  }

  const goToNextStep = () => {
    setGlobalError(null)

    if (currentStep === 1) {
      if (centerImagesUploading || paymentQrUploading) {
        setGlobalError(
          t("createCenter.validation.imageUploadPending", {
            defaultValue: "Please wait for image uploads to finish.",
          })
        )
        return
      }
      if (!validateCenterStep()) return
      centerMutation.mutate()
      return
    }

    if (currentStep === 2) {
      if (!validatePriceSlots()) return
      priceSlotsMutation.mutate()
      return
    }

    if (currentStep === 3) {
      if (!validatePolicy()) return
      policyMutation.mutate()
      return
    }

    if (currentStep === 4) {
      setCurrentStep(5)
      return
    }

    if (currentStep === 5) {
      if (serviceImageUploading || productImageUploading) {
        setGlobalError(
          t("createCenter.validation.imageUploadPending", {
            defaultValue: "Please wait for image uploads to finish.",
          })
        )
        return
      }
      setCurrentStep(6)
      return
    }

    if (currentStep === 6) {
      finalizeMutation.mutate()
    }
  }

  const goToPreviousStep = () => {
    setGlobalError(null)
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  const addPriceSlot = () => {
    setPriceSlots((current) => [
      ...current,
      {
        id: createId(),
        ...priceSlotDefaults,
      },
    ])
  }

  const removePriceSlot = (slot: PriceSlotDraft) => {
    if (slot.serverId) {
      setPriceSlotDeleteTarget(slot)
      return
    }
    setPriceSlots((current) => current.filter((item) => item.id !== slot.id))
  }

  const confirmRemovePriceSlot = () => {
    if (!priceSlotDeleteTarget?.serverId) return
    deletePriceSlotMutation.mutate(priceSlotDeleteTarget.serverId)
  }

  const addCourtDraft = () => {
    if (!courtDraft.name.trim()) {
      setGlobalError(
        t("createCenter.validation.courtNameRequired", {
          defaultValue: "Please enter a court name.",
        })
      )
      return
    }
    setCourtDrafts((current) => [...current, { id: createId(), ...courtDraft }])
    setCourtDraft((current) => ({ ...current, name: "" }))
  }

  const addServiceDraft = () => {
    if (serviceImageUploading) {
      setGlobalError(
        t("createCenter.validation.imageUploadPending", {
          defaultValue: "Please wait for image uploads to finish.",
        })
      )
      return
    }
    if (
      !serviceDraft.name.trim() ||
      !serviceDraft.price ||
      !Number.isFinite(Number(serviceDraft.price))
    ) {
      setGlobalError(
        t("createCenter.validation.serviceRequired", {
          defaultValue: "Please enter a valid service name and price.",
        })
      )
      return
    }
    setServiceDrafts((current) => [
      ...current,
      { id: createId(), ...serviceDraft },
    ])
    setServiceDraft((current) => ({
      ...current,
      name: "",
      price: "",
      unit: "VND / h",
      description: "",
      imageUrl: "",
    }))
  }

  const addProductDraft = () => {
    if (productImageUploading) {
      setGlobalError(
        t("createCenter.validation.imageUploadPending", {
          defaultValue: "Please wait for image uploads to finish.",
        })
      )
      return
    }
    if (
      !productDraft.name.trim() ||
      !productDraft.price ||
      !productDraft.stock ||
      !Number.isFinite(Number(productDraft.price)) ||
      !Number.isFinite(Number(productDraft.stock))
    ) {
      setGlobalError(
        t("createCenter.validation.productRequired", {
          defaultValue: "Please enter a valid product name, price and stock.",
        })
      )
      return
    }
    setProductDrafts((current) => [
      ...current,
      { id: createId(), ...productDraft },
    ])
    setProductDraft((current) => ({
      ...current,
      name: "",
      price: "",
      stock: "",
    }))
  }

  const renderStepTitle = () => {
    if (currentStep === 1)
      return t("createCenter.sections.centerInfo", {
        defaultValue: "Center information",
      })
    if (currentStep === 2)
      return t("createCenter.sections.priceSlots", {
        defaultValue: "Price slots",
      })
    if (currentStep === 3)
      return t("createCenter.sections.policy", {
        defaultValue: "Cancellation policy",
      })
    if (currentStep === 4)
      return t("createCenter.sections.courts", { defaultValue: "Courts" })
    if (currentStep === 5)
      return t("createCenter.sections.inventory", {
        defaultValue: "Products & services",
      })
    return t("createCenter.sections.review", {
      defaultValue: "Review and finish",
    })
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {t("createCenter.page.badge", {
                  defaultValue: "Sport center management",
                })}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("createCenter.page.title", {
                defaultValue: "Create Sport Center",
              })}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("createCenter.page.subtitle", {
                defaultValue:
                  "Create the center first, then configure pricing, policy, courts, services, and products in a guided wizard.",
              })}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            {t("common.back")}
          </Button>
        </div>

        {/* Main 2-Column Wizard Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Sidebar Stepper */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="sticky top-6 gap-0 rounded-2xl pb-0 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("createCenter.sectionTitles.setupSteps", {
                    defaultValue: "Setup Steps",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <WizardStepper
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  steps={steps}
                  onStepClick={(step) => setCurrentStep(step)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Active Form Step & Actions */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="gap-0 rounded-2xl pb-0 shadow-xs">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-1 text-[11px]">
                      {t("createCenter.stepLabel", { defaultValue: "Step" })}{" "}
                      {currentStep} / {totalSteps}
                    </Badge>
                    <CardTitle className="text-xl">
                      {renderStepTitle()}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {currentStep === 1 && (
                  <Step1CenterInfo
                    centerDraft={centerDraft}
                    setCenterDraft={setCenterDraft}
                    setPaymentQrUploading={setPaymentQrUploading}
                    setCenterImagesUploading={setCenterImagesUploading}
                  />
                )}

                {currentStep === 2 && (
                  <Step2PriceSlots
                    priceSlots={priceSlots}
                    setPriceSlots={setPriceSlots}
                    addPriceSlot={addPriceSlot}
                    removePriceSlot={removePriceSlot}
                    priceSlotDeleteTarget={priceSlotDeleteTarget}
                    setPriceSlotDeleteTarget={setPriceSlotDeleteTarget}
                    confirmRemovePriceSlot={confirmRemovePriceSlot}
                    isDeleting={deletePriceSlotMutation.isPending}
                  />
                )}

                {currentStep === 3 && (
                  <Step3Policy policy={policy} setPolicy={setPolicy} />
                )}

                {currentStep === 4 && (
                  <Step4Courts
                    courtDraft={courtDraft}
                    setCourtDraft={setCourtDraft}
                    courtDrafts={courtDrafts}
                    setCourtDrafts={setCourtDrafts}
                    addCourtDraft={addCourtDraft}
                  />
                )}

                {currentStep === 5 && (
                  <Step5Inventory
                    serviceTab={serviceTab}
                    setServiceTab={setServiceTab}
                    serviceDraft={serviceDraft}
                    setServiceDraft={setServiceDraft}
                    serviceDrafts={serviceDrafts}
                    setServiceDrafts={setServiceDrafts}
                    addServiceDraft={addServiceDraft}
                    setServiceImageUploading={setServiceImageUploading}
                    productDraft={productDraft}
                    setProductDraft={setProductDraft}
                    productDrafts={productDrafts}
                    setProductDrafts={setProductDrafts}
                    addProductDraft={addProductDraft}
                    setProductImageUploading={setProductImageUploading}
                  />
                )}

                {currentStep === 6 && (
                  <Step6Review
                    centerSnapshot={centerSnapshot}
                    centerDraft={centerDraft}
                    priceSlots={priceSlots}
                    policy={policy}
                    courtDrafts={courtDrafts}
                    serviceDrafts={serviceDrafts}
                    productDrafts={productDrafts}
                  />
                )}

                {/* Wizard Action Footer */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={
                      currentStep === 1 ||
                      centerMutation.isPending ||
                      priceSlotsMutation.isPending ||
                      deletePriceSlotMutation.isPending ||
                      policyMutation.isPending ||
                      finalizeMutation.isPending
                    }
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    {t("common.previous")}
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentStep === 4 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentStep(5)}
                      >
                        {t("createCenter.actions.skip", {
                          defaultValue: "Skip",
                        })}
                      </Button>
                    )}
                    {currentStep === 5 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentStep(6)}
                      >
                        {t("createCenter.actions.skip", {
                          defaultValue: "Skip",
                        })}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={
                        centerMutation.isPending ||
                        priceSlotsMutation.isPending ||
                        deletePriceSlotMutation.isPending ||
                        policyMutation.isPending ||
                        finalizeMutation.isPending
                      }
                    >
                      {(centerMutation.isPending ||
                        priceSlotsMutation.isPending ||
                        policyMutation.isPending ||
                        finalizeMutation.isPending) && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      {currentStep === 6
                        ? t("createCenter.actions.finish", {
                            defaultValue: "Finish",
                          })
                        : t("createCenter.actions.next", {
                            defaultValue: "Tiếp theo",
                          })}
                      {currentStep < 6 && (
                        <ArrowRight className="ml-2 size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
