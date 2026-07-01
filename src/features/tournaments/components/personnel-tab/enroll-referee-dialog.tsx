"use client"

import { Loader2, RefreshCw, UserPlus2 } from "lucide-react"
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
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

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
  const enrollReferee = usePersonnelStore((s) => s.enrollReferee)
  const [isPending, startTransition] = useTransition()

  // Generate a random avatar URL using Dicebear
  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7)
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`
  }

  // Local Form State
  const [form, setForm] = useState({
    refereeId: "",
    refereeName: "",
    refereeEmail: "",
    refereeAvatar: "",
    phone: "",
  })

  // Set defaults when opening the dialog
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setForm({
        refereeId: `ref_${Date.now()}`,
        refereeName: "",
        refereeEmail: "",
        refereeAvatar: generateRandomAvatar(),
        phone: "",
      })
    }
    onOpenChange(open)
  }

  const handleRefreshAvatar = () => {
    setForm((prev) => ({
      ...prev,
      refereeAvatar: generateRandomAvatar(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.refereeName.trim()) {
      toast.error(
        t("personnel.enrollDialog.nameRequired", {
          defaultValue: "Full Name is required",
        })
      )
      return
    }
    if (!form.refereeEmail.trim()) {
      toast.error(
        t("personnel.enrollDialog.emailRequired", {
          defaultValue: "Email is required",
        })
      )
      return
    }

    startTransition(async () => {
      const res = await enrollReferee(form)
      if (res.success) {
        toast.success(
          t("personnel.enrollDialog.successToast", {
            defaultValue: "Referee enrolled successfully!",
          })
        )
        handleOpenChange(false)
      } else {
        toast.error(
          res.error ||
            t("personnel.enrollDialog.failToast", {
              defaultValue: "Failed to enroll referee",
            })
        )
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl bg-white shadow-xl sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <UserPlus2 className="h-5.5 w-5.5 text-emerald-600" />
              {t("personnel.enrollDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {t("personnel.enrollDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4 border-t border-b border-gray-100 py-5">
            {/* Referee Photo / Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl border border-emerald-100 bg-gray-50 shadow-xs">
                <AvatarImage src={form.refereeAvatar} alt="Avatar preview" />
                <AvatarFallback className="rounded-xl bg-emerald-50 text-xl font-bold text-emerald-700">
                  RF
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-500">
                  {t("personnel.enrollDialog.avatarLabel")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("personnel.enrollDialog.avatarPlaceholder")}
                    value={form.refereeAvatar}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        refereeAvatar: e.target.value,
                      }))
                    }
                    className="h-8 w-60 bg-white text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-gray-500 hover:bg-gray-50 hover:text-emerald-600"
                    onClick={handleRefreshAvatar}
                    title="Generate Random Avatar"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Unique ID */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-id"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.idLabel")}
              </Label>
              <Input
                id="enroll-id"
                placeholder={t("personnel.enrollDialog.idPlaceholder")}
                value={form.refereeId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, refereeId: e.target.value }))
                }
                className="bg-white text-sm"
                required
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-name"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.nameLabel")}
              </Label>
              <Input
                id="enroll-name"
                placeholder={t("personnel.enrollDialog.namePlaceholder")}
                value={form.refereeName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, refereeName: e.target.value }))
                }
                className="bg-white text-sm"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-email"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.emailLabel")}
              </Label>
              <Input
                id="enroll-email"
                type="email"
                placeholder={t("personnel.enrollDialog.emailPlaceholder")}
                value={form.refereeEmail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, refereeEmail: e.target.value }))
                }
                className="bg-white text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="enroll-phone"
                className="text-sm font-semibold text-gray-700"
              >
                {t("personnel.enrollDialog.phoneLabel")}
              </Label>
              <Input
                id="enroll-phone"
                type="tel"
                placeholder={t("personnel.enrollDialog.phonePlaceholder")}
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="bg-white text-sm"
              />
            </div>
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
              disabled={isPending}
              className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("personnel.enrollDialog.submitBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
