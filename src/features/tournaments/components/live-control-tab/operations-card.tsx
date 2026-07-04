"use client"

import { Loader2, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../types/tournament-event"

interface OperationsCardProps {
  events: TournamentEvent[]
  dispatchEventId: string
  setDispatchEventId: (id: string) => void
  onDispatch: () => void
  onSync: () => void
  isDispatching: boolean
  isSyncing: boolean
}

export function OperationsCard({
  events,
  dispatchEventId,
  setDispatchEventId,
  onDispatch,
  onSync,
  isDispatching,
  isSyncing,
}: OperationsCardProps) {
  const { t } = useTournamentTranslation()
  const activeDispatchEventId =
    dispatchEventId || (events.length > 0 ? events[0].id.toString() : "")

  return (
    <Card className="gap-0 border-gray-200 pb-0 shadow-sm lg:col-span-1">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-bold text-gray-800">
          {t("liveControl.operations.title", {
            defaultValue: "Tournament Operations",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Dispatch Section */}
        <div className="space-y-2.5">
          <Label className="font-semibold text-gray-700">
            {t("liveControl.operations.dispatchTitle", {
              defaultValue: "Dispatch Matches",
            })}
          </Label>
          <p className="text-xs text-gray-500">
            {t("liveControl.operations.dispatchDesc", {
              defaultValue:
                "Send scheduled matches of the selected event to the match service for referee scoring.",
            })}
          </p>
          <div className="space-y-3">
            <Select
              value={activeDispatchEventId}
              onValueChange={setDispatchEventId}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue
                  placeholder={t("liveControl.operations.chooseEvent", {
                    defaultValue: "Choose Event",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                {events.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id.toString()}>
                    {evt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={onDispatch}
              disabled={isDispatching || events.length === 0}
              className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-700"
            >
              {isDispatching ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />{" "}
                  {t("liveControl.operations.btnDispatch", {
                    defaultValue: "Dispatch",
                  })}
                </>
              )}
            </Button>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Sync Section */}
        <div className="space-y-2.5">
          <Label className="font-semibold text-gray-700">
            {t("liveControl.operations.syncTitle", {
              defaultValue: "Sync Match Results",
            })}
          </Label>
          <p className="text-xs text-gray-500">
            {t("liveControl.operations.syncDesc", {
              defaultValue:
                "Fetch and update match scores, completed sets, and advancement status from referee scoring sheets.",
            })}
          </p>
          <Button
            onClick={onSync}
            disabled={isSyncing}
            variant="outline"
            className="w-full border-emerald-600 font-medium text-emerald-700 hover:bg-emerald-50"
          >
            {isSyncing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("liveControl.operations.btnSync", {
              defaultValue: "Synchronize All Matches",
            })}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
