"use client"

import { Loader2, Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Sponsor } from "@/features/tournaments/types/sponsor"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  addSponsorAction,
  deleteSponsorAction,
  getSponsorsAction,
} from "../../actions/sponsor-actions"
import { AddSponsorForm } from "./add-sponsor-form"
import { SponsorCard } from "./sponsor-card"
import { SponsorStats } from "./sponsor-stats"

interface SponsorsProps {
  tournamentId: string
  isEditable: boolean
}

export function Sponsors({ tournamentId, isEditable }: SponsorsProps) {
  const { t } = useTournamentTranslation()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch sponsors from backend on mount/tournamentId change
  useEffect(() => {
    if (tournamentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true)
      getSponsorsAction(tournamentId).then((res) => {
        if (res.success && res.data) {
          setSponsors(res.data)
        } else {
          toast.error(
            res.error ||
              t("sponsors.loadError", {
                defaultValue: "Failed to load sponsors",
              })
          )
        }
        setIsLoading(false)
      })
    }
  }, [tournamentId])

  // Sort sponsors by amount descending (highest support first)
  const sortedSponsors = [...sponsors].sort((a, b) => b.amount - a.amount)

  // Calculate statistics
  const totalContributions = sortedSponsors.reduce(
    (sum, s) => sum + s.amount,
    0
  )
  const activeSponsorsCount = sortedSponsors.length
  const avgContribution =
    activeSponsorsCount > 0
      ? Math.round(totalContributions / activeSponsorsCount)
      : 0

  const handleAddSponsor = async (newSponsor: {
    name: string
    amount: number
    logoUrl: string
    websiteUrl: string
  }) => {
    const res = await addSponsorAction(
      {
        name: newSponsor.name,
        logoUrl: newSponsor.logoUrl,
        amount: newSponsor.amount,
        websiteUrl: newSponsor.websiteUrl,
      },
      tournamentId
    )

    if (res.success && res.data) {
      toast.success(
        t("sponsors.addSuccess", {
          defaultValue: "Sponsor added successfully!",
        })
      )

      setSponsors((prev) => [...prev, res.data])
      setIsCreateOpen(false)
    } else {
      toast.error(
        res.error ||
          t("sponsors.addError", {
            defaultValue: "Failed to add sponsor",
          })
      )
    }
  }

  const handleDeleteSponsor = async (id: string) => {
    try {
      const res = await deleteSponsorAction(id, tournamentId)
      if (res.success) {
        toast.success(
          t("sponsors.deleteSuccess", {
            defaultValue: "Sponsor deleted successfully!",
          })
        )
        setSponsors((prev) => prev.filter((s) => s.id !== id))
      } else {
        toast.error(
          res.error ||
            t("sponsors.deleteError", {
              defaultValue: "Failed to delete sponsor",
            })
        )
      }
    } catch (error) {
      console.error("Failed to delete sponsor:", error)
      toast.error(
        t("sponsors.deleteError", {
          defaultValue: "Failed to delete sponsor",
        })
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {t("sponsors.title")}
            </h1>
            <p className="text-gray-600">{t("sponsors.subtitle")}</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!isEditable}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("sponsors.addSponsor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{t("sponsors.dialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("sponsors.dialog.description")}
                </DialogDescription>
              </DialogHeader>
              <AddSponsorForm
                onAdd={handleAddSponsor}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <SponsorStats
          totalContributions={totalContributions}
          activeSponsorsCount={activeSponsorsCount}
          avgContribution={avgContribution}
        />

        {/* Sponsors List */}
        {sortedSponsors.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">
              {t("sponsors.emptyState")}
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSponsors.map((sponsor, index) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  index={index}
                  onDelete={handleDeleteSponsor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
