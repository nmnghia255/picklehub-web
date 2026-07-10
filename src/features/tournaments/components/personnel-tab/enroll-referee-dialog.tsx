"use client"

import { AlertCircle, Loader2, Mail, UserPlus2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/features/profile/types"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { searchUserByEmailAction } from "../../actions/referee-actions"
import { usePersonnelStore } from "../../stores/use-personnel-store"

interface EnrollRefereeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EnrollRefereeDialog({
  isOpen,
  onOpenChange,
}: EnrollRefereeDialogProps) {
  const { t } = useTournamentTranslation()
  const inviteReferee = usePersonnelStore((s) => s.inviteReferee)
  const [isPending, startTransition] = useTransition()

  // Local Form State
  const [refereeEmail, setRefereeEmail] = useState("")
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [hasNoAccount, setHasNoAccount] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchedEmail, setSearchedEmail] = useState("")

  // Set defaults when opening/closing the dialog
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setRefereeEmail("")
      setUserProfile(null)
      setHasNoAccount(false)
      setSearchError(null)
      setIsSearching(false)
      setSearchedEmail("")
    }
    onOpenChange(open)
  }

  const handleVerify = async () => {
    const trimmedEmail = refereeEmail.trim()
    if (!trimmedEmail) return

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setSearchError(
        t("personnel.enrollDialog.invalidEmail", {
          defaultValue: "Please enter a valid email address.",
        })
      )
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setUserProfile(null)
    setHasNoAccount(false)
    setSearchedEmail(trimmedEmail)

    try {
      const res = await searchUserByEmailAction(trimmedEmail)
      if (res.success) {
        if (res.user) {
          setUserProfile(res.user as User)
        } else {
          setHasNoAccount(true)
        }
      } else {
        setSearchError(res.error || "Failed to search user profile")
        toast.error(res.error || "Failed to search user")
      }
    } catch {
      setSearchError(
        t("personnel.enrollDialog.fetchFailed", {
          defaultValue: "Failed to fetch user profile.",
        })
      )
      toast.error("Failed to verify email")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchedEmail) {
      startTransition(async () => {
        const res = await inviteReferee(searchedEmail)
        if (res.success) {
          toast.success(
            t("personnel.enrollDialog.inviteSuccessToast", {
              defaultValue: "Invitation sent successfully!",
            })
          )
          handleOpenChange(false)
        } else {
          toast.error(res.error || "Failed to send invitation")
        }
      })
    } else {
      toast.error(
        t("personnel.enrollDialog.verifyFirst", {
          defaultValue: "Please verify the referee email first",
        })
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl bg-white shadow-xl sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <UserPlus2 className="h-5.5 w-5.5 text-emerald-600" />
              {t("personnel.enrollDialog.title", {
                defaultValue: "Invite Referee",
              })}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {t("personnel.enrollDialog.description", {
                defaultValue:
                  "Enter a referee's email to send them a tournament invitation.",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4 border-t border-b border-gray-100 py-5">
            {/* Email Input with Verify Button */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-email"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.emailLabel", {
                  defaultValue: "Referee Email",
                })}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="enroll-email"
                  type="email"
                  placeholder={t("personnel.enrollDialog.emailPlaceholder", {
                    defaultValue: "e.g. referee@example.com",
                  })}
                  value={refereeEmail}
                  onChange={(e) => {
                    setRefereeEmail(e.target.value)
                    setUserProfile(null)
                    setHasNoAccount(false)
                    setSearchError(null)
                  }}
                  className="flex-1 bg-white text-sm"
                  required
                  disabled={isSearching || isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleVerify()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={isSearching || isPending || !refereeEmail.trim()}
                  variant="outline"
                  className="border-emerald-250 shrink-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("personnel.enrollDialog.verifyBtn", {
                      defaultValue: "Search",
                    })
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Profile Preview Card (User Exists) */}
            {userProfile && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 transition-all hover:bg-emerald-50/50">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 rounded-xl border border-emerald-100 bg-white shadow-xs">
                    <AvatarImage
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName || userProfile.name}
                    />
                    <AvatarFallback className="rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                      {(userProfile.fullName || userProfile.name || "RF")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        {userProfile.fullName || userProfile.name}
                      </h4>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">
                          Email:
                        </span>
                        <span
                          className="max-w-[200px] truncate"
                          title={userProfile.email}
                        >
                          {userProfile.email || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-emerald-100/50 pt-2 text-center text-[11px] font-medium text-emerald-600">
                  ✓{" "}
                  {t("personnel.enrollDialog.verifiedStatus", {
                    defaultValue:
                      "User profile found! Ready to send invitation.",
                  })}
                </div>
              </div>
            )}

            {/* Invitation Notice (User Doesn't Exist) */}
            {hasNoAccount && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 transition-all">
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-amber-600" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">
                      {t("personnel.enrollDialog.noAccountTitle", {
                        defaultValue: "Email not registered in app",
                      })}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {t("personnel.enrollDialog.noAccountDesc", {
                        defaultValue:
                          "This email is not yet registered. An invitation will be sent to the address above.",
                        email: searchedEmail,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("personnel.roster.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || isSearching || (!userProfile && !hasNoAccount)
              }
              className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("personnel.enrollDialog.inviteBtn", {
                defaultValue: "Send Invitation",
              })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
