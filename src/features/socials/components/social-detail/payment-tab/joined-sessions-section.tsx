"use client"

import { format } from "date-fns"
import React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { PlaySession } from "../../../types/play-session"

interface JoinedSessionsSectionProps {
  sessions?: PlaySession[]
  totalFee: number
}

export function JoinedSessionsSection({
  sessions,
  totalFee,
}: JoinedSessionsSectionProps) {
  const { t } = useSocialsTranslation()
  const joinedSessions = sessions || []

  if (joinedSessions.length === 0) return null

  return (
    <Card className="gap-0 overflow-hidden pb-0">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">{t("payment.joinedSessions")}</CardTitle>
        <CardDescription className="mt-1">
          {t("payment.joinedSessionsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {joinedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10 sm:p-6"
            >
              <div>
                <p className="font-medium">
                  {session.title || t("common.playSession")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span suppressHydrationWarning>
                    {format(new Date(session.startTime), "dd/MM/yyyy, HH:mm")} -{" "}
                    {format(new Date(session.endTime), "HH:mm")}
                  </span>
                </p>
              </div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrencyVnd(session.sessionFee || 0)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t-2 border-border/60 bg-muted/20 p-4 sm:p-6">
          <p className="text-lg font-semibold">{t("payment.totalFeeToPay")}</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrencyVnd(totalFee)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
