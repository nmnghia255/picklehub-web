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
    <Card className="sticky top-16 border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          {t("eventDetail.registration", { defaultValue: "Registration" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Status Banner */}
        {/* User Status Banner */}
        {userRegistration &&
          (() => {
            let bannerStyle =
              "border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-950/20 text-yellow-950 dark:text-yellow-200"
            let bannerIcon = (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            )
            let bannerTitle = t("eventDetail.statusPending", {
              defaultValue: "Pending Approval",
            })
            let bannerDesc = t("eventDetail.descPending", {
              defaultValue:
                "Your registration request has been submitted. Please wait for the tournament managers to accept your request before submitting payment.",
            })

            if (userRegistration.status === "rejected") {
              bannerStyle =
                "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-950 dark:text-red-200"
              bannerIcon = (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )
              bannerTitle = t("eventDetail.statusRejected", {
                defaultValue: "Rejected",
              })
              bannerDesc = t("eventDetail.descRejected", {
                defaultValue:
                  "Your registration request has been rejected by the organizer.",
              })
            } else if (userRegistration.status === "withdrawn") {
              bannerStyle =
                "border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/20 text-gray-950 dark:text-zinc-300"
              bannerIcon = (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
              )
              bannerTitle = t("eventDetail.statusWithdrawn", {
                defaultValue: "Withdrawn",
              })
              bannerDesc = t("eventDetail.descWithdrawn", {
                defaultValue: "You have withdrawn from this event.",
              })
            } else if (userRegistration.status === "waitlisted") {
              bannerStyle =
                "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200"
              bannerIcon = (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              )
              bannerTitle = t("eventDetail.statusWaitlisted", {
                defaultValue: "Waitlisted",
              })
              bannerDesc = t("eventDetail.descWaitlisted", {
                defaultValue: "You are on the waitlist for this event.",
              })
            } else if (userRegistration.status === "approved") {
              const isPaid =
                userRegistration.paymentStatus === "completed" ||
                userRegistration.paymentStatus === "paid"
              const isVerifying = userRegistration.paymentStatus === "verifying"

              if (isPaid) {
                bannerStyle =
                  "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200"
                bannerIcon = (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                )
                bannerTitle = t("eventDetail.statusConfirmed", {
                  defaultValue: "Confirmed",
                })
                bannerDesc = t("eventDetail.descConfirmed", {
                  defaultValue:
                    "You are successfully registered for this event. See you on the courts!",
                })
              } else if (isVerifying) {
                bannerStyle =
                  "border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200"
                bannerIcon = (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                )
                bannerTitle = t("eventDetail.statusVerifyingPayment", {
                  defaultValue: "Verifying Payment",
                })
                bannerDesc = t("eventDetail.descVerifyingPayment", {
                  defaultValue:
                    "Payment proof uploaded. The organizer is verifying your payment.",
                })
              } else {
                bannerStyle =
                  "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200"
                bannerIcon = (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                )
                bannerTitle = t("eventDetail.statusAwaitingPayment", {
                  defaultValue: "Awaiting Payment",
                })
                bannerDesc = t("eventDetail.descAwaitingPayment", {
                  defaultValue:
                    "Your registration has been approved! Please upload your payment proof to complete registration.",
                })
              }
            }

            return (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm ${bannerStyle}`}
              >
                {bannerIcon}
                <div>
                  <span className="block text-xs font-bold tracking-wider uppercase">
                    {bannerTitle}
                  </span>
                  <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">
                    {bannerDesc}
                  </p>
                </div>
              </div>
            )
          })()}

        {event.entryFee !== undefined && !userRegistration && (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-400">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold">
                {t("eventDetail.entryFee", { defaultValue: "Entry Fee" })}
              </span>
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-zinc-100">
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
        ) : userRegistration.status === "approved" &&
          (userRegistration.paymentStatus === "pending" ||
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
            className="w-full border border-gray-200 bg-gray-100 py-3 font-extrabold text-gray-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500"
          >
            {userRegistration.status === "pending"
              ? t("eventDetail.waitingForApproval", {
                  defaultValue: "Waiting for Approval",
                })
              : userRegistration.paymentStatus === "verifying"
                ? t("eventDetail.paymentVerifying", {
                    defaultValue: "Verifying Payment",
                  })
                : t("eventDetail.alreadyRegistered", {
                    defaultValue: "Already Registered",
                  })}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
