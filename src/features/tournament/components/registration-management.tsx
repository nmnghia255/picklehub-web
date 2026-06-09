import { Check, Eye, X } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { registrations } from "../mock-data/registration-management"

export function RegistrationManagement() {
  const { t } = useTournamentTranslation()
  const [selectedPlayer, setSelectedPlayer] = useState<
    (typeof registrations)[0] | null
  >(null)

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            {t("registrations.title")}
          </h1>
          <p className="text-gray-600">{t("registrations.subtitle")}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              {t("registrations.tabs.pending", { count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("registrations.tabs.approved", { count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("registrations.tabs.rejected", { count: 0 })}
            </TabsTrigger>
            <TabsTrigger value="waitlisted">
              {t("registrations.tabs.waitlisted", { count: 1 })}
            </TabsTrigger>
            <TabsTrigger value="withdrawn">
              {t("registrations.tabs.withdrawn", { count: 0 })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("registrations.table.player")}</TableHead>
                      <TableHead>{t("registrations.table.partner")}</TableHead>
                      <TableHead>{t("registrations.table.event")}</TableHead>
                      <TableHead>{t("registrations.table.rating")}</TableHead>
                      <TableHead>{t("registrations.table.payment")}</TableHead>
                      <TableHead>{t("registrations.table.date")}</TableHead>
                      <TableHead className="text-right">
                        {t("registrations.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations
                      .filter((r) => r.status === "pending")
                      .map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {reg.player.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">
                                {reg.player.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {reg.partner ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                    {reg.partner.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {reg.partner.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{reg.event}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{reg.player.rating}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                reg.paymentStatus === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {reg.paymentStatus === "completed"
                                ? t("registrations.table.paid")
                                : t("registrations.table.pending")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {reg.registrationDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPlayer(reg)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("registrations.table.player")}</TableHead>
                      <TableHead>{t("registrations.table.partner")}</TableHead>
                      <TableHead>{t("registrations.table.event")}</TableHead>
                      <TableHead>{t("registrations.table.rating")}</TableHead>
                      <TableHead>{t("registrations.table.payment")}</TableHead>
                      <TableHead>{t("registrations.table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations
                      .filter((r) => r.status === "approved")
                      .map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {reg.player.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">
                                {reg.player.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {reg.partner ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                    {reg.partner.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {reg.partner.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{reg.event}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{reg.player.rating}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-700">
                              {t("registrations.table.paid")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {reg.registrationDate}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlisted" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("registrations.table.player")}</TableHead>
                      <TableHead>{t("registrations.table.event")}</TableHead>
                      <TableHead>{t("registrations.table.rating")}</TableHead>
                      <TableHead>{t("registrations.table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations
                      .filter((r) => r.status === "waitlisted")
                      .map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {reg.player.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">
                                {reg.player.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{reg.event}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{reg.player.rating}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {reg.registrationDate}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Player Details Sheet */}
        <Sheet
          open={!!selectedPlayer}
          onOpenChange={() => setSelectedPlayer(null)}
        >
          <SheetContent className="w-96">
            <SheetHeader>
              <SheetTitle>{t("registrations.profile.title")}</SheetTitle>
              <SheetDescription>
                {t("registrations.profile.description")}
              </SheetDescription>
            </SheetHeader>
            {selectedPlayer && (
              <div className="mt-6 space-y-6">
                <div className="text-center">
                  <Avatar className="mx-auto mb-3 h-20 w-20">
                    <AvatarFallback className="bg-emerald-100 text-xl text-emerald-700">
                      {selectedPlayer.player.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPlayer.player.name}
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {t("registrations.profile.duprRating", {
                      rating: selectedPlayer.player.rating,
                    })}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    {t("registrations.profile.registrationDetails")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("registrations.profile.event")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {selectedPlayer.event}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("registrations.profile.registrationDate")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {selectedPlayer.registrationDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {t("registrations.profile.paymentStatus")}
                      </span>
                      <Badge
                        className={
                          selectedPlayer.paymentStatus === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {selectedPlayer.paymentStatus === "completed"
                          ? t("registrations.table.paid")
                          : t("registrations.table.pending")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="mb-3 font-semibold text-gray-900">
                    {t("registrations.profile.matchHistory")}
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>
                      {t("registrations.profile.historyStats", {
                        wins: 23,
                        losses: 15,
                      })}
                    </p>
                    <p className="mt-1">
                      {t("registrations.profile.previousTournaments", {
                        count: 5,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
