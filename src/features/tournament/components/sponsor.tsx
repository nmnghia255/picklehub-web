"use client"

import { Award, Plus, Trash2, Trophy, Upload, Users } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface Sponsor {
  id: string
  name: string
  logo: string | null // base64 string or object URL
  price: number
}

const INITIAL_SPONSORS: Sponsor[] = [
  { id: "1", name: "Pickleball Pro Shop", logo: null, price: 7500 },
  { id: "2", name: "Apex Paddles", logo: null, price: 5000 },
  { id: "3", name: "Hydrate Zone", logo: null, price: 3500 },
  { id: "4", name: "Local Diner", logo: null, price: 1200 },
]

export function Sponsors() {
  const { t } = useTournamentTranslation()
  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Sort sponsors by price descending (highest support first)
  const sortedSponsors = [...sponsors].sort((a, b) => b.price - a.price)

  // Calculate statistics
  const totalContributions = sortedSponsors.reduce((sum, s) => sum + s.price, 0)
  const activeSponsorsCount = sortedSponsors.length
  const avgContribution =
    activeSponsorsCount > 0
      ? Math.round(totalContributions / activeSponsorsCount)
      : 0

  const handleAddSponsor = (newSponsor: Omit<Sponsor, "id">) => {
    const sponsor: Sponsor = {
      ...newSponsor,
      id: Date.now().toString(),
    }
    setSponsors((prev) => [...prev, sponsor])
    setIsCreateOpen(false)
  }

  const handleDeleteSponsor = (id: string) => {
    if (confirm(t("sponsors.deleteConfirm"))) {
      setSponsors((prev) => prev.filter((s) => s.id !== id))
    }
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
              <Button className="bg-emerald-600 hover:bg-emerald-700">
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
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-emerald-100 bg-emerald-50/20">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("sponsors.stats.totalContributions")}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${totalContributions.toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/20">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("sponsors.stats.activeSponsors")}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeSponsorsCount}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-purple-50/20">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("sponsors.stats.avgContribution")}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ${avgContribution.toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

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
            {/* Top 3 Highlight Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSponsors.map((sponsor, index) => {
                const isTop3 = index < 3
                // Styling variants for top 3 positions
                const rankStyles = [
                  // Rank 1
                  {
                    border:
                      "border-amber-400 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/10 shadow-amber-100/40",
                    badge: "bg-amber-100 text-amber-800 border-amber-200",
                    iconColor: "text-amber-500",
                    rankText: "#1 Supporter",
                  },
                  // Rank 2
                  {
                    border:
                      "border-slate-300 bg-gradient-to-br from-slate-50/40 via-white to-slate-50/10 shadow-slate-100/40",
                    badge: "bg-slate-100 text-slate-800 border-slate-200",
                    iconColor: "text-slate-400",
                    rankText: "#2 Supporter",
                  },
                  // Rank 3
                  {
                    border:
                      "border-orange-300 bg-gradient-to-br from-orange-50/40 via-white to-orange-50/10 shadow-orange-100/40",
                    badge: "bg-orange-100 text-orange-800 border-orange-200",
                    iconColor: "text-orange-600",
                    rankText: "#3 Supporter",
                  },
                ]

                const style = isTop3 ? rankStyles[index] : null

                return (
                  <Card
                    key={sponsor.id}
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
                        {/* Logo Container */}
                        <div
                          className={`relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border ${
                            isTop3
                              ? "border-amber-100 bg-white"
                              : "border-gray-100 bg-gray-50/50"
                          }`}
                        >
                          {sponsor.logo ? (
                            <Image
                              src={sponsor.logo}
                              alt={sponsor.name}
                              fill
                              sizes="96px"
                              className="object-contain p-2"
                              unoptimized
                            />
                          ) : (
                            <div
                              className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br text-2xl font-bold ${
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

                        {/* Details */}
                        <h4 className="line-clamp-1 text-lg font-bold text-gray-900">
                          {sponsor.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {t("financials.transactions.amount")}
                        </p>
                        <p
                          className={`mt-1 text-xl font-extrabold ${
                            isTop3 ? "text-emerald-600" : "text-gray-900"
                          }`}
                        >
                          ${sponsor.price.toLocaleString()}
                        </p>

                        {/* Action Toolbar */}
                        <div className="mt-6 flex w-full items-center justify-end border-t border-gray-100 pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSponsor(sponsor.id)}
                            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface AddSponsorFormProps {
  onAdd: (sponsor: Omit<Sponsor, "id">) => void
  onClose: () => void
}

function AddSponsorForm({ onAdd, onClose }: AddSponsorFormProps) {
  const { t } = useTournamentTranslation()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [logo, setLogo] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { name?: string; price?: string } = {}

    if (!name.trim()) {
      newErrors.name = t("sponsors.dialog.validationName")
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = t("sponsors.dialog.validationPrice")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAdd({
      name: name.trim(),
      price: priceNum,
      logo,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      <div>
        <Label htmlFor="sponsor-name">{t("sponsors.dialog.nameLabel")}</Label>
        <Input
          id="sponsor-name"
          placeholder={t("sponsors.dialog.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1.5 ${errors.name ? "border-red-500" : ""}`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sponsor-price">{t("sponsors.dialog.priceLabel")}</Label>
        <Input
          id="sponsor-price"
          type="number"
          placeholder={t("sponsors.dialog.pricePlaceholder")}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`mt-1.5 ${errors.price ? "border-red-500" : ""}`}
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-500">{errors.price}</p>
        )}
      </div>

      <div>
        <Label>{t("sponsors.dialog.logoLabel")}</Label>
        <div className="mt-1.5 flex items-center gap-4">
          {logo ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image
                src={logo}
                alt="Logo preview"
                fill
                sizes="64px"
                className="object-contain p-1.5"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="absolute top-0.5 right-0.5 rounded-full bg-gray-900/60 p-0.5 text-white hover:bg-gray-900"
              >
                <Plus className="h-3 w-3 rotate-45" />
              </button>
            </div>
          ) : (
            <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
              <Upload className="h-5 w-5 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <div className="flex-1 text-xs text-gray-500">
            <p className="font-semibold">
              {t("sponsors.dialog.logoUploadHint")}
            </p>
            <p>{t("sponsors.dialog.logoSizeHint")}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("sponsors.dialog.cancel")}
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          {t("sponsors.dialog.submit")}
        </Button>
      </div>
    </form>
  )
}
