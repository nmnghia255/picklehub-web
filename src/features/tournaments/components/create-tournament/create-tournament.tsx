"use client"

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { createFullTournamentAction } from "../../actions/tournament-actions"
import { useCreateTournamentStore } from "../../stores/create-tournament-store"
import type { TournamentRequest } from "../../types/tournament"
import { Step1BasicInfo } from "./step-1-basic-info"
import { Step2Registration } from "./step-2-registration"
import { Step3Events } from "./step-3-events"
import { Step4Prizes } from "./step-4-prizes"
import { Step5Review } from "./step-5-review"

export function CreateTournament() {
  const router = useRouter()
  const { t } = useTournamentTranslation()

  const currentStep = useCreateTournamentStore((state) => state.currentStep)
  const setCurrentStep = useCreateTournamentStore(
    (state) => state.setCurrentStep
  )
  const formValues = useCreateTournamentStore((state) => state.formValues)
  const events = useCreateTournamentStore((state) => state.events)
  const prizes = useCreateTournamentStore((state) => state.prizes)
  const resetForm = useCreateTournamentStore((state) => state.resetForm)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5

  const steps = [
    { number: 1, title: t("create.steps.basicInfo") },
    { number: 2, title: t("create.steps.registration") },
    { number: 3, title: t("create.steps.events") },
    { number: 4, title: t("create.steps.prizes") },
    { number: 5, title: t("create.steps.review") },
  ]

  const handlePublish = async () => {
    setIsSubmitting(true)
    try {
      const tournamentPayload: TournamentRequest = {
        name: formValues.name,
        venue: formValues.venue,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        capacity: Number(formValues.maxParticipants) || 0,
        banner:
          formValues.banner ||
          "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
      }

      const eventsPayload = events.map((event) => ({
        localId: event.id,
        name: event.name,
        type: event.type,
        skillRange: event.skillRange,
        gender: event.gender,
        capacity: event.capacity,
        entryFee: event.entryFee,
      }))

      const prizesPayload = prizes.map((prize) => ({
        localEventId: prize.eventId,
        name: prize.name,
        rewardType: prize.rewardType,
        value: prize.value,
        description: prize.description,
      }))

      const result = await createFullTournamentAction({
        tournament: tournamentPayload,
        events: eventsPayload,
        prizes: prizesPayload,
      })

      if (result.success && result.tournamentId) {
        toast.success(
          t("create.successMessage", {
            defaultValue: "Tournament created successfully!",
          })
        )
        resetForm()
        router.push(`/tournament/${result.tournamentId}`)
      } else {
        toast.error(
          result.error ||
            t("create.errorMessage", {
              defaultValue: "Failed to create tournament.",
            })
        )
      }
    } catch (error) {
      console.error(error)
      toast.error(
        t("create.errorMessage", {
          defaultValue: "Failed to create tournament.",
        })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await handlePublish()
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto mb-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {t("create.title")}
            </h1>
            <p className="text-gray-600">{t("create.subtitle")}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("create.back")}
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                      step.number < currentStep
                        ? "bg-emerald-600 text-white"
                        : step.number === currentStep
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center text-xs whitespace-nowrap text-gray-600">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 -mt-8 h-px flex-1 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1BasicInfo />}
            {currentStep === 2 && <Step2Registration />}
            {currentStep === 3 && <Step3Events />}
            {currentStep === 4 && <Step4Prizes />}
            {currentStep === 5 && <Step5Review />}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("create.buttons.previous")}
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("create.buttons.publishing", {
                      defaultValue: "Publishing...",
                    })}
                  </>
                ) : (
                  <>
                    {currentStep === totalSteps
                      ? t("create.buttons.publish")
                      : t("create.buttons.next")}
                    {currentStep < totalSteps && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
