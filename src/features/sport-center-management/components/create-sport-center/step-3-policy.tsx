import { Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { createId, type PolicyDraft } from "./types"

export function Step3Policy({
  policy,
  setPolicy,
}: {
  policy: PolicyDraft
  setPolicy: React.Dispatch<React.SetStateAction<PolicyDraft>>
}) {
  const { t } = useSportCenterManagementTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
        <div className="space-y-0.5">
          <p className="font-medium">
            {t("createCenter.fields.allowCancellation", {
              defaultValue: "Allow cancellation",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("createCenter.help.allowCancellation", {
              defaultValue:
                "Enable preservation credit refund tiers for confirmed bookings.",
            })}
          </p>
        </div>
        <Switch
          checked={policy.allowCancellation}
          onCheckedChange={(checked) =>
            setPolicy((current) => ({
              ...current,
              allowCancellation: checked,
            }))
          }
        />
      </div>

      {policy.allowCancellation && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">
              {t("createCenter.sectionTitles.refundTiers", {
                defaultValue: "Refund Tiers",
              })}
            </h4>
          </div>

          {policy.tiers.map((tier, index) => (
            <div
              key={tier.id}
              className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-end"
            >
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`min-days-${tier.id}`}>
                    {t("createCenter.fields.minDaysBeforeStart", {
                      defaultValue: "Minimum days before start",
                    })}
                  </Label>
                  <Input
                    id={`min-days-${tier.id}`}
                    type="number"
                    min={0}
                    value={tier.minDaysBeforeStart}
                    onChange={(e) =>
                      setPolicy((current) => ({
                        ...current,
                        tiers: current.tiers.map((item) =>
                          item.id === tier.id
                            ? {
                                ...item,
                                minDaysBeforeStart: Number(e.target.value),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`refund-${tier.id}`}>
                    {t("createCenter.fields.refundPercent", {
                      defaultValue: "Refund percent",
                    })}
                  </Label>
                  <Input
                    id={`refund-${tier.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={tier.refundPercent}
                    onChange={(e) =>
                      setPolicy((current) => ({
                        ...current,
                        tiers: current.tiers.map((item) =>
                          item.id === tier.id
                            ? {
                                ...item,
                                refundPercent: Number(e.target.value),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Badge variant="secondary" className="font-mono text-xs">
                  {t("createCenter.labels.tier", {
                    index: index + 1,
                    defaultValue: `Tier ${index + 1}`,
                  })}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPolicy((current) => ({
                      ...current,
                      tiers: current.tiers.filter(
                        (item) => item.id !== tier.id
                      ),
                    }))
                  }
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPolicy((current) => ({
                ...current,
                tiers: [
                  ...current.tiers,
                  {
                    id: createId(),
                    minDaysBeforeStart: 1,
                    refundPercent: 50,
                  },
                ],
              }))
            }
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            {t("createCenter.actions.addTier", {
              defaultValue: "Add cancellation tier",
            })}
          </Button>
        </div>
      )}
    </div>
  )
}
