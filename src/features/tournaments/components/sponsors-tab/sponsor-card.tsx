"use client"

import { ExternalLink, Loader2, Trash2, Trophy } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Sponsor } from "@/features/tournaments/types/sponsor"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface SponsorCardProps {
  sponsor: Sponsor
  index: number
  onDelete: (id: string) => Promise<void>
}

export function SponsorCard({ sponsor, index, onDelete }: SponsorCardProps) {
  const { t } = useTournamentTranslation()
  const isTop3 = index < 3
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(String(sponsor.id))
      setIsAlertOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Styling variants for top 3 positions
  const rankStyles = [
    // Rank 1
    {
      border:
        "border-amber-400 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/10 shadow-amber-100/40",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      iconColor: "text-amber-500",
      rankText: t("sponsors.rank1", { defaultValue: "#1 Supporter" }),
    },
    // Rank 2
    {
      border:
        "border-slate-300 bg-gradient-to-br from-slate-50/40 via-white to-slate-50/10 shadow-slate-100/40",
      badge: "bg-slate-100 text-slate-800 border-slate-200",
      iconColor: "text-slate-400",
      rankText: t("sponsors.rank2", { defaultValue: "#2 Supporter" }),
    },
    // Rank 3
    {
      border:
        "border-orange-300 bg-gradient-to-br from-orange-50/40 via-white to-orange-50/10 shadow-orange-100/40",
      badge: "bg-orange-100 text-orange-800 border-orange-200",
      iconColor: "text-orange-600",
      rankText: t("sponsors.rank3", { defaultValue: "#3 Supporter" }),
    },
  ]

  const style = isTop3 ? rankStyles[index] : null

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isTop3
          ? `border-2 ${style?.border} shadow-sm`
          : "border-gray-200 bg-white"
      }`}
    >
      {isTop3 && (
        <div className="absolute top-3 right-3">
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style?.badge}`}
          >
            <Trophy className={`h-3 w-3 ${style?.iconColor}`} />
            {style?.rankText}
          </span>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Logo Container & Name */}
          {sponsor.websiteUrl ? (
            <a
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center hover:opacity-90"
            >
              <div
                className={`relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border transition-all group-hover:scale-105 group-hover:border-emerald-500/50 ${
                  isTop3
                    ? "border-amber-100 bg-white"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                {sponsor.logoUrl ? (
                  <Image
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-xl bg-linear-to-br text-2xl font-bold ${
                      index === 0
                        ? "from-amber-400 to-amber-600 text-white"
                        : index === 1
                          ? "from-slate-400 to-slate-600 text-white"
                          : index === 2
                            ? "from-orange-400 to-orange-600 text-white"
                            : "from-emerald-400 to-emerald-600 text-white"
                    }`}
                  >
                    {sponsor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
                {sponsor.name}
              </h4>
            </a>
          ) : (
            <>
              <div
                className={`relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border ${
                  isTop3
                    ? "border-amber-100 bg-white"
                    : "border-gray-100 bg-gray-50/50"
                }`}
              >
                {sponsor.logoUrl ? (
                  <Image
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-xl bg-linear-to-br text-2xl font-bold ${
                      index === 0
                        ? "from-amber-400 to-amber-600 text-white"
                        : index === 1
                          ? "from-slate-400 to-slate-600 text-white"
                          : index === 2
                            ? "from-orange-400 to-orange-600 text-white"
                            : "from-emerald-400 to-emerald-600 text-white"
                    }`}
                  >
                    {sponsor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 className="line-clamp-1 text-lg font-bold text-gray-900">
                {sponsor.name}
              </h4>
            </>
          )}

          <p className="mt-1 text-sm text-gray-500">
            {t("financials.transactions.amount", { defaultValue: "Amount" })}
          </p>
          <p
            className={`mt-1 text-xl font-extrabold ${
              isTop3 ? "text-emerald-600" : "text-gray-900"
            }`}
          >
            {sponsor.amount.toLocaleString("vi-VN")} VND
          </p>

          {/* Action Toolbar */}
          <div className="mt-6 flex w-full items-center justify-between border-t border-gray-100 pt-4">
            {sponsor.websiteUrl ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
              >
                <a
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-xs">
                    {t("sponsors.website", { defaultValue: "Website" })}
                  </span>
                </a>
              </Button>
            ) : (
              <div />
            )}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("sponsors.deleteTitle", {
                      defaultValue: "Remove Sponsor",
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("sponsors.deleteConfirm", {
                      defaultValue:
                        "Are you sure you want to remove this sponsor?",
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    {t("sponsors.dialog.cancel", { defaultValue: "Cancel" })}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.deleting", { defaultValue: "Deleting..." })}
                      </>
                    ) : (
                      t("sponsors.delete", { defaultValue: "Delete" })
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
