"use client"

import { AlertCircle, CheckCircle2, DollarSign, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { RegistrationResponse } from "../../../types/registration"
import type { TournamentEvent } from "../../../types/tournament-event"

interface EventRegistrationCardProps {
  event: TournamentEvent
  userRegistration?: RegistrationResponse
  onRegisterClick: () => void
  onUploadProofClick: () => void
  isRegistering?: boolean
}

export function EventRegistrationCard({
  event,
  userRegistration,
  onRegisterClick,
  onUploadProofClick,
  isRegistering = false,
}: EventRegistrationCardProps) {
  const { t } = useTournamentTranslation()

  const registeredCount = event.participants || 0
  const maxCapacity = event.capacity
  const isFull = registeredCount >= maxCapacity

  return (
    <Card className="sticky top-16 border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">
          {t("eventDetail.registration", { defaultValue: "Registration" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Status Banner */}
        {userRegistration ? (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
              userRegistration.status === "approved"
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-950"
                : userRegistration.status === "rejected"
                  ? "border-red-200 bg-red-50/50 text-red-950"
                  : "border-yellow-200 bg-yellow-50/50 text-yellow-950"
            }`}
          >
            {userRegistration.status === "approved" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            )}
            <div>
              <span className="block text-xs font-bold tracking-wider uppercase">
                {userRegistration.status === "approved"
                  ? t("eventDetail.registeredStatus", {
                      defaultValue: "Registered",
                    })
                  : userRegistration.status === "pending"
                    ? t("eventDetail.pendingApproval", {
                        defaultValue: "Pending Approval",
                      })
                    : userRegistration.status === "waitlisted"
                      ? t("eventDetail.waitlisted", {
                          defaultValue: "Waitlisted",
                        })
                      : userRegistration.status}
              </span>
              <p className="mt-1 text-xs text-gray-600">
                {userRegistration.status === "approved"
                  ? t("eventDetail.regApprovedDesc", {
                      defaultValue:
                        "You are successfully registered for this event. See you on the courts!",
                    })
                  : userRegistration.status === "pending"
                    ? t("eventDetail.regPendingDesc", {
                        defaultValue:
                          "Your registration request has been submitted. The organizer will verify your payment details shortly.",
                      })
                    : t("eventDetail.regProcessedDesc", {
                        defaultValue: "Your registration has been processed.",
                      })}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
            <div className="flex items-center gap-1.5 text-gray-600">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">
                {t("eventDetail.entryFee", { defaultValue: "Entry Fee" })}
              </span>
            </div>
            <span className="text-lg font-black text-gray-900">
              {event.entryFee
                ? `${event.entryFee.toLocaleString()} VND`
                : t("eventDetail.free", { defaultValue: "Free" })}
            </span>
          </div>
        )}

        {/* Actions Button */}
        {!userRegistration ? (
          <Button
            onClick={onRegisterClick}
            disabled={isFull || isRegistering}
            className="w-full bg-emerald-600 py-3 font-extrabold text-white shadow-md shadow-emerald-600/5 transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-600/10"
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("eventDetail.registering", {
                  defaultValue: "Registering...",
                })}
              </>
            ) : isFull ? (
              t("eventDetail.eventFull", { defaultValue: "Event Full" })
            ) : (
              t("eventDetail.registerNow", { defaultValue: "Register Now" })
            )}
          </Button>
        ) : (userRegistration.paymentStatus === "pending" ||
            userRegistration.paymentStatus === "unpaid") &&
          !userRegistration.paymentProofUrl ? (
          <Button
            onClick={onUploadProofClick}
            className="w-full animate-pulse bg-amber-600 py-3 font-extrabold text-white shadow-md shadow-amber-600/5 transition-all duration-300 hover:bg-amber-700 hover:shadow-amber-600/10"
          >
            {t("eventDetail.uploadProof", {
              defaultValue: "Upload Payment Proof",
            })}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full border border-gray-200 bg-gray-100 py-3 font-extrabold text-gray-400"
          >
            {t("eventDetail.alreadyRegistered", {
              defaultValue: "Already Registered",
            })}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
