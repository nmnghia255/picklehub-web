import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { CourtLifecycleStatus, CourtType } from "../../types/court"
import type { CourtDraft } from "./types"

export function Step4Courts({
  courtDraft,
  setCourtDraft,
  courtDrafts,
  setCourtDrafts,
  addCourtDraft,
}: {
  courtDraft: {
    name: string
    type: CourtType
    status: CourtLifecycleStatus
  }
  setCourtDraft: React.Dispatch<
    React.SetStateAction<{
      name: string
      type: CourtType
      status: CourtLifecycleStatus
    }>
  >
  courtDrafts: CourtDraft[]
  setCourtDrafts: React.Dispatch<React.SetStateAction<CourtDraft[]>>
  addCourtDraft: () => void
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Form section */}
      <div className="space-y-4 rounded-xl border bg-muted/20 p-5 lg:col-span-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">
            {t("createCenter.sectionTitles.addNewCourt", {
              defaultValue: "Add New Court",
            })}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="court-name">
              {t("createCenter.fields.courtName")}
            </Label>
            <Input
              id="court-name"
              value={courtDraft.name}
              onChange={(e) =>
                setCourtDraft((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder={t("createCenter.placeholders.courtName", {
                index: courtDrafts.length + 1,
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="court-type">
              {t("createCenter.fields.courtType")}
            </Label>
            <Select
              value={courtDraft.type}
              onValueChange={(val) =>
                setCourtDraft((current) => ({
                  ...current,
                  type: val as CourtType,
                }))
              }
            >
              <SelectTrigger id="court-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDOOR">
                  {t("courtManagement.types.INDOOR")}
                </SelectItem>
                <SelectItem value="OUTDOOR">
                  {t("courtManagement.types.OUTDOOR")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court-status">
              {t("createCenter.fields.courtStatus")}
            </Label>
            <Select
              value={courtDraft.status}
              onValueChange={(val) =>
                setCourtDraft((current) => ({
                  ...current,
                  status: val as CourtLifecycleStatus,
                }))
              }
            >
              <SelectTrigger id="court-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  {t("courtManagement.status.active")}
                </SelectItem>
                <SelectItem value="MAINTENANCE">
                  {t("courtManagement.status.maintenance")}
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  {t("courtManagement.status.archived")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" className="w-full" onClick={addCourtDraft}>
            <Plus className="mr-2 size-4" />
            {t("createCenter.actions.addCourt")}
          </Button>
        </div>
      </div>

      {/* List section */}
      <div className="space-y-3 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {t("createCenter.sectionTitles.addedCourts", {
              defaultValue: "Added Courts",
            })}{" "}
            ({courtDrafts.length})
          </h3>
        </div>

        {courtDrafts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <p>{t("createCenter.review.skippedCourts")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courtDrafts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`courtManagement.types.${item.type}`)} ·{" "}
                    {t(`courtManagement.status.${item.status.toLowerCase()}`)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCourtDrafts((current) =>
                      current.filter((draft) => draft.id !== item.id)
                    )
                  }
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
