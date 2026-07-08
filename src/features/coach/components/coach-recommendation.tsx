"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/features/auth/hooks/use-session"

import {
  useMyCoachProfile,
  useRecommendCoach,
} from "../hooks/use-coach-queries"

export function CoachRecommendation() {
  const { t } = useTranslation("common")
  const session = useSession()
  const { data: profile } = useMyCoachProfile({ enabled: !!session?.user })
  const recommendMutation = useRecommendCoach()
  const [recommendToId, setRecommendToId] = useState("")
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (!profile?.id || !recommendToId.trim()) return
    recommendMutation.mutate(
      {
        coachId: profile.id,
        dto: {
          recommendedToId: recommendToId.trim(),
          message: message.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          setRecommendToId("")
          setMessage("")
        },
      }
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>{t("coach.discovery.recommendCoach")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("coach.discovery.recommendDescription")}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              {t("coach.discovery.recommendButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("coach.discovery.recommendDialogTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("coach.discovery.recommendDialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recommendToId">
                  {t("coach.discovery.recommendUserIdLabel")}
                </Label>
                <Input
                  id="recommendToId"
                  value={recommendToId}
                  onChange={(e) => setRecommendToId(e.target.value)}
                  placeholder={t("coach.discovery.recommendUserIdPlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendMessage">
                  {t("coach.discovery.recommendMessageLabel")}
                </Label>
                <Textarea
                  id="recommendMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={t("coach.discovery.recommendMessagePlaceholder")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("coach.discovery.recommendCancelButton")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={recommendMutation.isPending || !recommendToId.trim()}
              >
                {recommendMutation.isPending
                  ? t("coach.discovery.recommendSubmitting")
                  : t("coach.discovery.recommendSubmitButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {recommendMutation.isSuccess && (
          <p className="text-sm font-medium text-green-600">
            {t("coach.discovery.recommendSuccess")}
          </p>
        )}

        {recommendMutation.isError && (
          <p className="text-sm font-medium text-destructive">
            {recommendMutation.error?.message ??
              t("coach.discovery.recommendError")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
