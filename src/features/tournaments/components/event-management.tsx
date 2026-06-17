import { Edit, Plus, Trash2, Users } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { events } from "../mock-data/event-management"
import { Team } from "../types/player"

export function EventManagement() {
  const { t } = useTournamentTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("events.title")}
              </h1>
              <p className="text-gray-600">{t("events.subtitle")}</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("events.createEvent")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("events.dialog.title")}</DialogTitle>
                  <DialogDescription>
                    {t("events.dialog.description")}
                  </DialogDescription>
                </DialogHeader>
                <CreateEventForm onClose={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("events.table.title", { count: events.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("events.table.eventName")}</TableHead>
                  <TableHead>{t("events.table.type")}</TableHead>
                  <TableHead>{t("events.table.skillRange")}</TableHead>
                  <TableHead>{t("events.table.gender")}</TableHead>
                  <TableHead>{t("events.table.participants")}</TableHead>
                  <TableHead>{t("events.table.entryFee")}</TableHead>
                  <TableHead>{t("events.table.status")}</TableHead>
                  <TableHead className="text-right">
                    {t("events.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-gray-900">
                      {event.name}
                    </TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell>{event.skillRange}</TableCell>
                    <TableCell>{event.gender}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {event.participants}/{event.capacity}
                      </div>
                    </TableCell>
                    <TableCell>${event.entryFee}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          event.status === "full"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {event.status === "full"
                          ? t("events.table.statusFull")
                          : t("events.table.statusOpen")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CreateEventForm({ onClose }: { onClose: () => void }) {
  const { t } = useTournamentTranslation()
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="event-name">{t("events.dialog.nameLabel")}</Label>
          <Input
            id="event-name"
            placeholder={t("events.dialog.namePlaceholder")}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="event-type">{t("events.dialog.typeLabel")}</Label>
          <Select>
            <SelectTrigger id="event-type" className="mt-1.5">
              <SelectValue placeholder={t("events.dialog.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singles">
                {t("events.dialog.types.singles")}
              </SelectItem>
              <SelectItem value="doubles">
                {t("events.dialog.types.doubles")}
              </SelectItem>
              <SelectItem value="team">
                {t("events.dialog.types.team")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gender">{t("events.dialog.genderLabel")}</Label>
          <Select>
            <SelectTrigger id="gender" className="mt-1.5">
              <SelectValue placeholder={t("events.dialog.genderPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="men">
                {t("events.dialog.genders.men")}
              </SelectItem>
              <SelectItem value="women">
                {t("events.dialog.genders.women")}
              </SelectItem>
              <SelectItem value="mixed">
                {t("events.dialog.genders.mixed")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="min-rating">{t("events.dialog.minRating")}</Label>
          <Input
            id="min-rating"
            type="number"
            step="0.1"
            placeholder="3.0"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="max-rating">{t("events.dialog.maxRating")}</Label>
          <Input
            id="max-rating"
            type="number"
            step="0.1"
            placeholder="4.0"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="capacity">{t("events.dialog.capacity")}</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="32"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="entry-fee">{t("events.dialog.entryFee")}</Label>
          <Input
            id="entry-fee"
            type="number"
            placeholder="290"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("events.dialog.cancel")}
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          {t("events.dialog.submit")}
        </Button>
      </div>
    </form>
  )
}
